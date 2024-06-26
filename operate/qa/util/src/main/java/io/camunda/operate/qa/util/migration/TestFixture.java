/*
 * Copyright Camunda Services GmbH and/or licensed to Camunda Services GmbH under
 * one or more contributor license agreements. See the NOTICE file distributed
 * with this work for additional information regarding copyright ownership.
 * Licensed under the Camunda License 1.0. You may not use this file
 * except in compliance with the Camunda License 1.0.
 */
package io.camunda.operate.qa.util.migration;

import io.camunda.operate.qa.util.TestContext;

/**
 * Test fixture to create test data for given version of Operate. Prerequisites: Elasticsearch is
 * running - it is either empty or contains indices of one of previous versions of Operate. Test
 * fixture must: * migrate data to newer version of Operate (when needed) * run appropriate version
 * of Zeebe * generates data for the given version and * make sure that data was imported to Operate
 */
public interface TestFixture {

  void setup(TestContext testContext);

  String getVersion();
}
