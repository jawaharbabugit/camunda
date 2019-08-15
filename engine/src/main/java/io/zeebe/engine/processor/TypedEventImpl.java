/*
 * Copyright Camunda Services GmbH and/or licensed to Camunda Services GmbH under
 * one or more contributor license agreements. See the NOTICE file distributed
 * with this work for additional information regarding copyright ownership.
 * Licensed under the Zeebe Community License 1.0. You may not use this file
 * except in compliance with the Zeebe Community License 1.0.
 */
package io.zeebe.engine.processor;

import com.fasterxml.jackson.annotation.JsonIgnore;
import io.zeebe.logstreams.log.LoggedEvent;
import io.zeebe.protocol.impl.encoding.MsgPackConverter;
import io.zeebe.protocol.impl.record.RecordMetadata;
import io.zeebe.protocol.impl.record.UnifiedRecordValue;
import io.zeebe.protocol.record.Record;
import io.zeebe.protocol.record.RecordType;
import io.zeebe.protocol.record.RejectionType;
import io.zeebe.protocol.record.ValueType;
import io.zeebe.protocol.record.intent.Intent;

@SuppressWarnings({"rawtypes"})
public class TypedEventImpl implements TypedRecord {
  protected LoggedEvent rawEvent;
  protected RecordMetadata metadata;
  protected UnifiedRecordValue value;
  private final int partitionId;

  public TypedEventImpl(int partitionId) {
    this.partitionId = partitionId;
  }

  public void wrap(LoggedEvent rawEvent, RecordMetadata metadata, UnifiedRecordValue value) {
    this.rawEvent = rawEvent;
    this.metadata = metadata;
    this.value = value;
  }

  public long getPosition() {
    return rawEvent.getPosition();
  }

  @Override
  public long getSourceRecordPosition() {
    return rawEvent.getSourceEventPosition();
  }

  @Override
  public long getTimestamp() {
    return rawEvent.getTimestamp();
  }

  @Override
  public Intent getIntent() {
    return metadata.getIntent();
  }

  @Override
  public int getPartitionId() {
    return partitionId;
  }

  @Override
  public RecordType getRecordType() {
    return metadata.getRecordType();
  }

  @Override
  public RejectionType getRejectionType() {
    return metadata.getRejectionType();
  }

  @Override
  public String getRejectionReason() {
    return metadata.getRejectionReason();
  }

  @Override
  public ValueType getValueType() {
    return metadata.getValueType();
  }

  @Override
  public long getKey() {
    return rawEvent.getKey();
  }

  @Override
  public UnifiedRecordValue getValue() {
    return value;
  }

  @Override
  @JsonIgnore
  public int getRequestStreamId() {
    return metadata.getRequestStreamId();
  }

  @Override
  @JsonIgnore
  public long getRequestId() {
    return metadata.getRequestId();
  }

  @JsonIgnore
  public int getMaxValueLength() {
    return this.rawEvent.getMaxValueLength();
  }

  @Override
  public String toJson() {
    return MsgPackConverter.convertJsonSerializableObjectToJson(this);
  }

  @Override
  public Record clone() {
    return CopiedRecords.createCopiedRecord(getPartitionId(), rawEvent);
  }

  @Override
  public String toString() {
    return "TypedEventImpl{" + "metadata=" + metadata + ", value=" + value + '}';
  }
}
