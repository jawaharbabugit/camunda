/*
 * Copyright Camunda Services GmbH and/or licensed to Camunda Services GmbH under
 * one or more contributor license agreements. See the NOTICE file distributed
 * with this work for additional information regarding copyright ownership.
 * Licensed under the Camunda License 1.0. You may not use this file
 * except in compliance with the Camunda License 1.0.
 */
package io.camunda.zeebe.gateway.cmd;

/**
 * Represents exceptional errors that occur in the gateway-broker client on the client side (i.e.
 * gateway side)
 */
public class ClientException extends RuntimeException {
  private static final long serialVersionUID = 1L;

  public ClientException() {}

  public ClientException(final Throwable cause) {
    super(cause);
  }

  public ClientException(final String message) {
    super(message);
  }

  public ClientException(final String message, final Throwable cause) {
    super(message, cause);
  }
}
