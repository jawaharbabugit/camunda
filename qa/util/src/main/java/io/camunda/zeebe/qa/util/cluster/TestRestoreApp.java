/*
 * Copyright Camunda Services GmbH and/or licensed to Camunda Services GmbH under
 * one or more contributor license agreements. See the NOTICE file distributed
 * with this work for additional information regarding copyright ownership.
 * Licensed under the Zeebe Community License 1.1. You may not use this file
 * except in compliance with the Zeebe Community License 1.1.
 */
package io.camunda.zeebe.qa.util.cluster;

import io.camunda.zeebe.broker.system.configuration.BrokerCfg;
import io.camunda.zeebe.restore.RestoreApp;
import io.camunda.zeebe.shared.Profile;
import java.util.function.Consumer;
import org.springframework.boot.builder.SpringApplicationBuilder;

/** Represents an instance of the {@link RestoreApp} Spring application. */
public final class TestRestoreApp extends TestSpringApplication<TestRestoreApp> {
  private final BrokerCfg config;
  private long backupId;

  public TestRestoreApp() {
    this(new BrokerCfg());
  }

  public TestRestoreApp(final BrokerCfg config) {
    super(RestoreApp.class);
    this.config = config;

    //noinspection resource
    withBean("config", config, BrokerCfg.class);
  }

  @Override
  public TestRestoreApp self() {
    return this;
  }

  @Override
  protected String[] commandLineArgs() {
    return new String[] {"--backupId=" + backupId};
  }

  @Override
  protected SpringApplicationBuilder createSpringBuilder() {
    return super.createSpringBuilder().profiles(Profile.RESTORE.getId());
  }

  public TestRestoreApp withBrokerConfig(final Consumer<BrokerCfg> modifier) {
    modifier.accept(config);
    return this;
  }

  public TestRestoreApp withBackupId(final long backupId) {
    this.backupId = backupId;
    return this;
  }
}
