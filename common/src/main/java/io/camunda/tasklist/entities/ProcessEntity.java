/*
 * Copyright Camunda Services GmbH and/or licensed to Camunda Services GmbH
 * under one or more contributor license agreements. Licensed under a proprietary license.
 * See the License.txt file for more information. You may not use this file
 * except in compliance with the proprietary license.
 */
package io.camunda.tasklist.entities;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

public class ProcessEntity extends TasklistZeebeEntity<ProcessEntity> {

  private String bpmnProcessId;

  private String name;

  private Integer version;

  private boolean startedByForm;

  private String formKey;
  private String formId;
  private Boolean isFormEmbedded;
  private List<ProcessFlowNodeEntity> flowNodes = new ArrayList<>();

  public String getName() {
    return name;
  }

  public ProcessEntity setName(String name) {
    this.name = name;
    return this;
  }

  public String getBpmnProcessId() {
    return bpmnProcessId;
  }

  public ProcessEntity setBpmnProcessId(String bpmnProcessId) {
    this.bpmnProcessId = bpmnProcessId;
    return this;
  }

  public List<ProcessFlowNodeEntity> getFlowNodes() {
    return flowNodes;
  }

  public ProcessEntity setFlowNodes(List<ProcessFlowNodeEntity> flowNodes) {
    this.flowNodes = flowNodes;
    return this;
  }

  public Integer getVersion() {
    return version;
  }

  public ProcessEntity setVersion(Integer version) {
    this.version = version;
    return this;
  }

  public String getFormKey() {
    return formKey;
  }

  public ProcessEntity setFormKey(String formKey) {
    this.formKey = formKey;
    return this;
  }

  public String getFormId() {
    return formId;
  }

  public ProcessEntity setFormId(String formId) {
    this.formId = formId;
    return this;
  }

  public Boolean getIsFormEmbedded() {
    return isFormEmbedded;
  }

  public ProcessEntity setIsFormEmbedded(Boolean isFormEmbedded) {
    this.isFormEmbedded = isFormEmbedded;
    return this;
  }

  public boolean isStartedByForm() {
    return startedByForm;
  }

  public ProcessEntity setStartedByForm(boolean startedByForm) {
    this.startedByForm = startedByForm;
    return this;
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) {
      return true;
    }
    if (o == null || getClass() != o.getClass()) {
      return false;
    }
    if (!super.equals(o)) {
      return false;
    }
    final ProcessEntity that = (ProcessEntity) o;
    return startedByForm == that.startedByForm
        && Objects.equals(bpmnProcessId, that.bpmnProcessId)
        && Objects.equals(name, that.name)
        && Objects.equals(version, that.version)
        && Objects.equals(formKey, that.formKey)
        && Objects.equals(formId, that.formId)
        && Objects.equals(isFormEmbedded, that.isFormEmbedded)
        && Objects.equals(flowNodes, that.flowNodes);
  }

  @Override
  public int hashCode() {
    return Objects.hash(
        super.hashCode(),
        bpmnProcessId,
        name,
        version,
        startedByForm,
        formKey,
        formId,
        isFormEmbedded,
        flowNodes);
  }
}
