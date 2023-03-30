/*
 * Copyright Camunda Services GmbH and/or licensed to Camunda Services GmbH
 * under one or more contributor license agreements. Licensed under a proprietary license.
 * See the License.txt file for more information. You may not use this file
 * except in compliance with the proprietary license.
 */
package io.camunda.tasklist.webapp.config;

import io.camunda.tasklist.webapp.security.TasklistURIs;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springdoc.core.GroupedOpenApi;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

@Configuration
public class OpenApiConfig {

  public static final String COOKIE_SECURITY_SCHEMA_NAME = "cookie";
  public static final SecurityScheme COOKIE_SECURITY_SCHEMA =
      new SecurityScheme()
          .type(SecurityScheme.Type.APIKEY)
          .in(SecurityScheme.In.COOKIE)
          .name(TasklistURIs.COOKIE_JSESSIONID);

  public static final String BEARER_SECURITY_SCHEMA_NAME = "bearer-key";
  public static final SecurityScheme BEARER_SECURITY_SCHEMA =
      new SecurityScheme().type(SecurityScheme.Type.HTTP).scheme("bearer").bearerFormat("JWT");

  @Profile("dev")
  @Bean
  public GroupedOpenApi internalApiV1() {
    return versionedInternalApi("v1");
  }

  @Bean
  public GroupedOpenApi publicApiV1() {
    return versionedPublicApi("v1");
  }

  private GroupedOpenApi versionedInternalApi(final String version) {
    return GroupedOpenApi.builder()
        .group("internal-api")
        .addOpenApiCustomiser(
            openApi -> {
              openApi
                  .info(
                      new Info()
                          .title("Tasklist webapp Internal API")
                          .description(
                              "<b>NOTE:</b> For internal use only.</br>"
                                  + "Please take into account that this is an <b>internal API</b> and it may be subject to changes "
                                  + "in the future without guaranteeing backward compatibility with previous versions.")
                          .contact(new Contact().url("https://www.camunda.com"))
                          .license(
                              new License()
                                  .name("License")
                                  .url("https://docs.camunda.io/docs/reference/licenses/")))
                  .getComponents()
                  .addSecuritySchemes(COOKIE_SECURITY_SCHEMA_NAME, COOKIE_SECURITY_SCHEMA)
                  .addSecuritySchemes(BEARER_SECURITY_SCHEMA_NAME, BEARER_SECURITY_SCHEMA);

              openApi.addSecurityItem(
                  new SecurityRequirement()
                      .addList(COOKIE_SECURITY_SCHEMA_NAME)
                      .addList(BEARER_SECURITY_SCHEMA_NAME));
            })
        .pathsToMatch(String.format("/%s/internal/**", version))
        .build();
  }

  private GroupedOpenApi versionedPublicApi(final String version) {
    return GroupedOpenApi.builder()
        .group(version)
        .addOpenApiCustomiser(
            openApi -> {
              openApi
                  .info(
                      new Info()
                          .title("Tasklist webapp API")
                          .description(
                              "Tasklist is a ready-to-use API application to rapidly implement business processes alongside user tasks in Zeebe.")
                          .version("v1")
                          .contact(new Contact().url("https://www.camunda.com"))
                          .license(
                              new License()
                                  .name("License")
                                  .url("https://docs.camunda.io/docs/reference/licenses/")))
                  .getComponents()
                  .addSecuritySchemes(COOKIE_SECURITY_SCHEMA_NAME, COOKIE_SECURITY_SCHEMA)
                  .addSecuritySchemes(BEARER_SECURITY_SCHEMA_NAME, BEARER_SECURITY_SCHEMA);

              openApi.addSecurityItem(
                  new SecurityRequirement()
                      .addList(COOKIE_SECURITY_SCHEMA_NAME)
                      .addList(BEARER_SECURITY_SCHEMA_NAME));
            })
        .pathsToMatch(String.format("/%s/**", version))
        .pathsToExclude(String.format("/%s/internal/**", version))
        .build();
  }
}
