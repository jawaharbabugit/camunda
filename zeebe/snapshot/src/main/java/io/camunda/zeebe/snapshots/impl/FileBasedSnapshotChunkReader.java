/*
 * Copyright Camunda Services GmbH and/or licensed to Camunda Services GmbH under
 * one or more contributor license agreements. See the NOTICE file distributed
 * with this work for additional information regarding copyright ownership.
 * Licensed under the Camunda License 1.0. You may not use this file
 * except in compliance with the Camunda License 1.0.
 */
package io.camunda.zeebe.snapshots.impl;

import io.camunda.zeebe.protocol.Protocol;
import io.camunda.zeebe.snapshots.SnapshotChunk;
import io.camunda.zeebe.snapshots.SnapshotChunkReader;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.ByteBuffer;
import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.NavigableSet;
import java.util.NoSuchElementException;
import java.util.TreeSet;
import org.agrona.AsciiSequenceView;
import org.agrona.DirectBuffer;
import org.agrona.concurrent.UnsafeBuffer;

/**
 * Implements a chunk reader where each chunk is a single file in a root directory. Chunks are then
 * ordered lexicographically, and the files are assumed to be immutable, i.e. no more are added to
 * the directory once this is created.
 */
public final class FileBasedSnapshotChunkReader implements SnapshotChunkReader {
  static final Charset ID_CHARSET = StandardCharsets.US_ASCII;

  private final Path directory;
  private final NavigableSet<CharSequence> chunks;
  private final CharSequenceView chunkIdView;

  private NavigableSet<CharSequence> chunksView;
  private final int totalCount;
  private final long snapshotChecksum;
  private final String snapshotID;

  FileBasedSnapshotChunkReader(final Path directory, final long checksum) throws IOException {
    this.directory = directory;
    chunks = collectChunks(directory);
    totalCount = chunks.size();
    chunksView = new TreeSet<>(chunks);
    chunkIdView = new CharSequenceView();

    snapshotChecksum = checksum;

    snapshotID = directory.getFileName().toString();
  }

  private NavigableSet<CharSequence> collectChunks(final Path directory) throws IOException {
    final var set = new TreeSet<>(CharSequence::compare);
    try (final var stream = Files.list(directory).sorted()) {
      stream.map(directory::relativize).map(Path::toString).forEach(set::add);
    }
    return set;
  }

  @Override
  public void reset() {
    chunksView = new TreeSet<>(chunks);
  }

  @Override
  public void seek(final ByteBuffer id) {
    if (id == null) {
      return;
    }

    final var path = decodeChunkId(id);
    chunksView = new TreeSet<>(chunks.tailSet(path, true));
  }

  @Override
  public ByteBuffer nextId() {
    if (chunksView.isEmpty()) {
      return null;
    }

    return encodeChunkId(chunksView.first());
  }

  @Override
  public void close() {
    chunks.clear();
    chunksView.clear();
  }

  @Override
  public boolean hasNext() {
    return !chunksView.isEmpty();
  }

  @Override
  public SnapshotChunk next() {
    final var chunkName = chunksView.pollFirst();
    if (chunkName == null) {
      throw new NoSuchElementException();
    }

    final var path = directory.resolve(chunkName.toString());

    try {
      return SnapshotChunkUtil.createSnapshotChunkFromFile(
          path, snapshotID, totalCount, snapshotChecksum);
    } catch (final IOException e) {
      throw new UncheckedIOException(e);
    }
  }

  private ByteBuffer encodeChunkId(final CharSequence path) {
    return ByteBuffer.wrap(path.toString().getBytes(ID_CHARSET)).order(Protocol.ENDIANNESS);
  }

  private CharSequence decodeChunkId(final ByteBuffer id) {
    return chunkIdView.wrap(id);
  }

  private static final class CharSequenceView {
    private final DirectBuffer wrapper = new UnsafeBuffer();
    private final AsciiSequenceView view = new AsciiSequenceView();

    private CharSequence wrap(final ByteBuffer buffer) {
      wrapper.wrap(buffer);
      return view.wrap(wrapper, 0, wrapper.capacity());
    }
  }
}
