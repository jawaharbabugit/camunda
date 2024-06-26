/*
 * Copyright Camunda Services GmbH and/or licensed to Camunda Services GmbH under
 * one or more contributor license agreements. See the NOTICE file distributed
 * with this work for additional information regarding copyright ownership.
 * Licensed under the Camunda License 1.0. You may not use this file
 * except in compliance with the Camunda License 1.0.
 */
package io.camunda.zeebe.transport;

public interface ServerOutput {
  /**
   * Sends the given response. The corresponding partition and request id is extracted from the
   * response object.
   *
   * <p>This method should decouple the the request handling, such that response sending can be done
   * later asynchronously.
   *
   * @param response the response which should be send
   */
  void sendResponse(ServerResponse response);
}
