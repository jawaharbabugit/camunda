/*
 * Copyright Camunda Services GmbH and/or licensed to Camunda Services GmbH under
 * one or more contributor license agreements. See the NOTICE file distributed
 * with this work for additional information regarding copyright ownership.
 * Licensed under the Camunda License 1.0. You may not use this file
 * except in compliance with the Camunda License 1.0.
 */
package io.camunda.zeebe.backup.common;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import io.camunda.zeebe.backup.api.Backup;
import io.camunda.zeebe.backup.api.BackupIdentifier;
import io.camunda.zeebe.backup.api.BackupStatus;
import io.camunda.zeebe.backup.api.BackupStatusCode;
import java.time.Instant;
import java.util.Optional;

@JsonSerialize(as = ManifestImpl.class)
@JsonDeserialize(as = ManifestImpl.class)
public sealed interface Manifest {

  static InProgressManifest createInProgress(final Backup backup) {
    final var creationTime = Instant.now();
    return new ManifestImpl(
        BackupIdentifierImpl.from(backup.id()),
        BackupDescriptorImpl.from(backup.descriptor()),
        StatusCode.IN_PROGRESS,
        FileSet.of(backup.snapshot()),
        FileSet.of(backup.segments()),
        creationTime,
        creationTime);
  }

  static FailedManifest createFailed(final BackupIdentifier id) {
    final var creationTime = Instant.now();
    return new ManifestImpl(
        BackupIdentifierImpl.from(id),
        null,
        StatusCode.FAILED,
        null,
        null,
        creationTime,
        creationTime);
  }

  BackupIdentifierImpl id();

  BackupDescriptorImpl descriptor();

  StatusCode statusCode();

  Instant createdAt();

  Instant modifiedAt();

  InProgressManifest asInProgress();

  CompletedManifest asCompleted();

  FailedManifest asFailed();

  static BackupStatus toStatus(final Manifest manifest) {
    return switch (manifest.statusCode()) {
      case IN_PROGRESS ->
          new BackupStatusImpl(
              manifest.id(),
              Optional.ofNullable(manifest.descriptor()),
              BackupStatusCode.IN_PROGRESS,
              Optional.empty(),
              Optional.ofNullable(manifest.createdAt()),
              Optional.ofNullable(manifest.modifiedAt()));
      case COMPLETED ->
          new BackupStatusImpl(
              manifest.id(),
              Optional.ofNullable(manifest.descriptor()),
              BackupStatusCode.COMPLETED,
              Optional.empty(),
              Optional.ofNullable(manifest.createdAt()),
              Optional.ofNullable(manifest.modifiedAt()));
      case FAILED ->
          new BackupStatusImpl(
              manifest.id(),
              Optional.ofNullable(manifest.descriptor()),
              BackupStatusCode.FAILED,
              Optional.ofNullable(manifest.asFailed().failureReason()),
              Optional.ofNullable(manifest.createdAt()),
              Optional.ofNullable(manifest.modifiedAt()));
    };
  }

  sealed interface InProgressManifest extends Manifest permits ManifestImpl {

    CompletedManifest complete();

    FailedManifest fail(final String failureReason);
  }

  sealed interface CompletedManifest extends Manifest permits ManifestImpl {

    FailedManifest fail(final String failureReason);

    FileSet snapshot();

    FileSet segments();
  }

  sealed interface FailedManifest extends Manifest permits ManifestImpl {

    String failureReason();
  }

  enum StatusCode {
    IN_PROGRESS,
    COMPLETED,
    FAILED
  }
}
