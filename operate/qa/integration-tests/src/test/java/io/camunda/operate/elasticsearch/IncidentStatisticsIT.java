/*
 * Copyright Camunda Services GmbH
 *
 * BY INSTALLING, DOWNLOADING, ACCESSING, USING, OR DISTRIBUTING THE SOFTWARE (“USE”), YOU INDICATE YOUR ACCEPTANCE TO AND ARE ENTERING INTO A CONTRACT WITH, THE LICENSOR ON THE TERMS SET OUT IN THIS AGREEMENT. IF YOU DO NOT AGREE TO THESE TERMS, YOU MUST NOT USE THE SOFTWARE. IF YOU ARE RECEIVING THE SOFTWARE ON BEHALF OF A LEGAL ENTITY, YOU REPRESENT AND WARRANT THAT YOU HAVE THE ACTUAL AUTHORITY TO AGREE TO THE TERMS AND CONDITIONS OF THIS AGREEMENT ON BEHALF OF SUCH ENTITY.
 * “Licensee” means you, an individual, or the entity on whose behalf you receive the Software.
 *
 * Permission is hereby granted, free of charge, to the Licensee obtaining a copy of this Software and associated documentation files to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject in each case to the following conditions:
 * Condition 1: If the Licensee distributes the Software or any derivative works of the Software, the Licensee must attach this Agreement.
 * Condition 2: Without limiting other conditions in this Agreement, the grant of rights is solely for non-production use as defined below.
 * "Non-production use" means any use of the Software that is not directly related to creating products, services, or systems that generate revenue or other direct or indirect economic benefits.  Examples of permitted non-production use include personal use, educational use, research, and development. Examples of prohibited production use include, without limitation, use for commercial, for-profit, or publicly accessible systems or use for commercial or revenue-generating purposes.
 *
 * If the Licensee is in breach of the Conditions, this Agreement, including the rights granted under it, will automatically terminate with immediate effect.
 *
 * SUBJECT AS SET OUT BELOW, THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 * NOTHING IN THIS AGREEMENT EXCLUDES OR RESTRICTS A PARTY’S LIABILITY FOR (A) DEATH OR PERSONAL INJURY CAUSED BY THAT PARTY’S NEGLIGENCE, (B) FRAUD, OR (C) ANY OTHER LIABILITY TO THE EXTENT THAT IT CANNOT BE LAWFULLY EXCLUDED OR RESTRICTED.
 */
package io.camunda.operate.elasticsearch;

import static io.camunda.operate.util.TestUtil.createIncident;
import static io.camunda.operate.util.TestUtil.createProcessInstanceEntity;
import static io.camunda.operate.util.TestUtil.createProcessVersions;
import static io.camunda.operate.webapp.rest.IncidentRestService.INCIDENT_URL;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import io.camunda.operate.entities.FlowNodeState;
import io.camunda.operate.entities.IncidentEntity;
import io.camunda.operate.entities.IncidentState;
import io.camunda.operate.entities.OperateEntity;
import io.camunda.operate.entities.ProcessEntity;
import io.camunda.operate.entities.listview.FlowNodeInstanceForListViewEntity;
import io.camunda.operate.entities.listview.ProcessInstanceForListViewEntity;
import io.camunda.operate.entities.listview.ProcessInstanceState;
import io.camunda.operate.util.OperateAbstractIT;
import io.camunda.operate.util.SearchTestRule;
import io.camunda.operate.util.TestUtil;
import io.camunda.operate.webapp.rest.dto.incidents.IncidentByProcessStatisticsDto;
import io.camunda.operate.webapp.rest.dto.incidents.IncidentsByErrorMsgStatisticsDto;
import io.camunda.operate.webapp.rest.dto.incidents.IncidentsByProcessGroupStatisticsDto;
import io.camunda.operate.webapp.security.identity.IdentityPermission;
import io.camunda.operate.webapp.security.identity.PermissionsService;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Iterator;
import java.util.List;
import java.util.Objects;
import java.util.Random;
import java.util.Set;
import java.util.stream.Collectors;
import org.junit.Rule;
import org.junit.Test;
import org.springframework.boot.test.mock.mockito.MockBean;

public class IncidentStatisticsIT extends OperateAbstractIT {

  public static final String LOAN_BPMN_PROCESS_ID = "loanProcess";
  public static final String LOAN_PROCESS_NAME = "Loan process";
  public static final String DEMO_BPMN_PROCESS_ID = "demoProcess";
  public static final String DEMO_PROCESS_NAME = "Demo process";
  public static final String ORDER_BPMN_PROCESS_ID = "orderProcess";
  public static final String ORDER_PROCESS_NAME = "Order process";
  public static final String NO_INSTANCES_PROCESS_ID = "noInstancesProcess";
  public static final String NO_INSTANCES_PROCESS_NAME = "No Instances Process";
  public static final String ERRMSG_OTHER = "Other error message";
  private static final String QUERY_INCIDENTS_BY_PROCESS_URL = INCIDENT_URL + "/byProcess";
  private static final String QUERY_INCIDENTS_BY_ERROR_URL = INCIDENT_URL + "/byError";
  @Rule public SearchTestRule searchTestRule = new SearchTestRule();
  @MockBean private PermissionsService permissionsService;
  private Random random = new Random();

  private String tenantId1 = "tenant1";
  private String tenantId2 = "tenant2";

  @Test
  public void testAbsentProcessDoesntThrowExceptions() throws Exception {
    List<OperateEntity> entities = new ArrayList<>();

    // Create a processInstance that has no matching process
    Long processDefinitionKey = 0L;
    ProcessInstanceForListViewEntity processInstance =
        createProcessInstanceEntity(ProcessInstanceState.ACTIVE, processDefinitionKey, "process");
    entities.add(processInstance);
    entities.addAll(createIncidents(processInstance, 1, 0));
    searchTestRule.persistNew(entities.toArray(new OperateEntity[entities.size()]));

    List<IncidentsByErrorMsgStatisticsDto> response = requestIncidentsByError();

    assertThat(response).hasSize(1);
  }

  @Test
  public void testIncidentStatisticsByError() throws Exception {
    createData();

    List<IncidentsByErrorMsgStatisticsDto> response = requestIncidentsByError();
    assertThat(response).hasSize(2);

    // assert NO_RETRIES_LEFT
    IncidentsByErrorMsgStatisticsDto incidentsByErrorStat = response.get(0);
    assertThat(incidentsByErrorStat.getErrorMessage()).isEqualTo(TestUtil.ERROR_MSG);
    assertThat(incidentsByErrorStat.getInstancesWithErrorCount()).isEqualTo(3L);
    assertThat(incidentsByErrorStat.getProcesses()).hasSize(2);

    final Iterator<IncidentByProcessStatisticsDto> iterator =
        incidentsByErrorStat.getProcesses().iterator();
    IncidentByProcessStatisticsDto next = iterator.next();
    assertThat(next.getName()).isEqualTo(DEMO_PROCESS_NAME + 1);
    assertThat(next.getBpmnProcessId()).isEqualTo(DEMO_BPMN_PROCESS_ID);
    assertThat(next.getTenantId()).isEqualTo(tenantId1);
    assertThat(next.getInstancesWithActiveIncidentsCount()).isEqualTo(2L);
    assertThat(next.getActiveInstancesCount()).isEqualTo(0);
    assertThat(next.getVersion()).isEqualTo(1);
    assertThat(next.getErrorMessage()).isEqualTo(TestUtil.ERROR_MSG);
    assertThat(next.getProcessId()).isNotNull();

    next = iterator.next();
    assertThat(next.getName()).isEqualTo(ORDER_PROCESS_NAME + 2);
    assertThat(next.getBpmnProcessId()).isEqualTo(ORDER_BPMN_PROCESS_ID);
    assertThat(next.getTenantId()).isEqualTo(tenantId2);
    assertThat(next.getInstancesWithActiveIncidentsCount()).isEqualTo(1L);
    assertThat(next.getActiveInstancesCount()).isEqualTo(0);
    assertThat(next.getVersion()).isEqualTo(2);
    assertThat(next.getErrorMessage()).isEqualTo(TestUtil.ERROR_MSG);
    assertThat(next.getProcessId()).isNotNull();

    // assert OTHER_ERRMSG
    incidentsByErrorStat = response.get(1);
    assertThat(incidentsByErrorStat.getErrorMessage()).isEqualTo(ERRMSG_OTHER);
    assertThat(incidentsByErrorStat.getInstancesWithErrorCount()).isEqualTo(2L);
    assertThat(incidentsByErrorStat.getProcesses()).hasSize(2);
    assertThat(incidentsByErrorStat.getProcesses())
        .allMatch(
            s ->
                s.getProcessId() != null
                    && s.getName().equals(DEMO_PROCESS_NAME + s.getVersion())
                    && s.getErrorMessage().equals(ERRMSG_OTHER)
                    && s.getTenantId().equals(tenantId1)
                    && s.getInstancesWithActiveIncidentsCount() == 1L
                    && (s.getVersion() == 1 || s.getVersion() == 2));
  }

  @Test
  public void testProcessAndIncidentStatistics() throws Exception {
    createData();

    List<IncidentsByProcessGroupStatisticsDto> processGroups = requestIncidentsByProcess();

    assertThat(processGroups).hasSize(3);
    assertDemoProcess(processGroups.get(0));
    assertOrderProcess(processGroups.get(1));
    assertLoanProcess(processGroups.get(2));
  }

  @Test
  public void testProcessWithoutInstancesIsSortedByVersionAscending() throws Exception {
    createNoInstancesProcessData(3);

    List<IncidentsByProcessGroupStatisticsDto> processGroups = requestIncidentsByProcess();

    assertThat(processGroups).hasSize(1);
    Collection<IncidentByProcessStatisticsDto> processes = processGroups.get(0).getProcesses();
    assertThat(processes).hasSize(3);

    Iterator<IncidentByProcessStatisticsDto> processIterator = processes.iterator();
    assertNoInstancesProcess(processIterator.next(), 1);
    assertNoInstancesProcess(processIterator.next(), 2);
    assertNoInstancesProcess(processIterator.next(), 3);
  }

  @Test
  public void testIncidentsByProcessWithPermisssionWhenAllowed() throws Exception {

    // given
    createData();

    // when
    when(permissionsService.getProcessesWithPermission(IdentityPermission.READ))
        .thenReturn(PermissionsService.ResourcesAllowed.all());

    // then
    List<IncidentsByProcessGroupStatisticsDto> response = requestIncidentsByProcess();

    assertThat(response).hasSize(3);
    assertThat(
            response.stream()
                .map(IncidentsByProcessGroupStatisticsDto::getBpmnProcessId)
                .collect(Collectors.toList()))
        .containsExactlyInAnyOrder(
            DEMO_BPMN_PROCESS_ID, ORDER_BPMN_PROCESS_ID, LOAN_BPMN_PROCESS_ID);
  }

  @Test
  public void testIncidentsByProcessWithPermisssionWhenNotAllowed() throws Exception {

    // given
    createData();

    // when
    when(permissionsService.getProcessesWithPermission(IdentityPermission.READ))
        .thenReturn(
            PermissionsService.ResourcesAllowed.withIds(
                Set.of(DEMO_BPMN_PROCESS_ID, ORDER_BPMN_PROCESS_ID)));

    // then
    List<IncidentsByProcessGroupStatisticsDto> response = requestIncidentsByProcess();

    assertThat(response).hasSize(2);
    assertThat(
            response.stream()
                .map(IncidentsByProcessGroupStatisticsDto::getBpmnProcessId)
                .collect(Collectors.toList()))
        .containsExactlyInAnyOrder(DEMO_BPMN_PROCESS_ID, ORDER_BPMN_PROCESS_ID);
  }

  @Test
  public void testIncidentsByErrorWithPermisssionWhenAllowed() throws Exception {

    // given
    createData();

    // when
    when(permissionsService.getProcessesWithPermission(IdentityPermission.READ))
        .thenReturn(PermissionsService.ResourcesAllowed.all());

    // then
    List<IncidentsByErrorMsgStatisticsDto> response = requestIncidentsByError();

    assertThat(response).hasSize(2);

    IncidentsByErrorMsgStatisticsDto incidentsByError1 =
        response.stream()
            .filter(x -> Objects.equals(x.getErrorMessage(), TestUtil.ERROR_MSG))
            .findFirst()
            .orElseThrow();
    // TODO: Check
    assertThat(incidentsByError1.getInstancesWithErrorCount()).isEqualTo(3);
    assertThat(incidentsByError1.getProcesses()).hasSize(2);
    assertThat(
            incidentsByError1.getProcesses().stream()
                .map(IncidentByProcessStatisticsDto::getBpmnProcessId)
                .collect(Collectors.toList()))
        .containsExactlyInAnyOrder(DEMO_BPMN_PROCESS_ID, ORDER_BPMN_PROCESS_ID);

    IncidentsByErrorMsgStatisticsDto incidentsByError2 =
        response.stream()
            .filter(x -> Objects.equals(x.getErrorMessage(), ERRMSG_OTHER))
            .findFirst()
            .orElseThrow();
    assertThat(incidentsByError2.getInstancesWithErrorCount()).isEqualTo(2);
    assertThat(incidentsByError2.getProcesses()).hasSize(2);
    assertThat(
            incidentsByError2.getProcesses().stream()
                .map(IncidentByProcessStatisticsDto::getBpmnProcessId)
                .collect(Collectors.toList()))
        .containsExactlyInAnyOrder(DEMO_BPMN_PROCESS_ID, DEMO_BPMN_PROCESS_ID);
  }

  @Test
  public void testIncidentsByErrorWithPermisssionWhenNotAllowed() throws Exception {

    // given
    createData();

    // when
    when(permissionsService.getProcessesWithPermission(IdentityPermission.READ))
        .thenReturn(PermissionsService.ResourcesAllowed.withIds(Set.of()));

    // then
    List<IncidentsByErrorMsgStatisticsDto> response = requestIncidentsByError();

    assertThat(response).isEmpty();
  }

  @Test
  public void testIncidentsByErrorWithPermisssionWhenOnlyDemoProcessAllowed() throws Exception {

    // given
    createData();

    // when
    when(permissionsService.getProcessesWithPermission(IdentityPermission.READ))
        .thenReturn(PermissionsService.ResourcesAllowed.withIds(Set.of(DEMO_BPMN_PROCESS_ID)));

    // then
    List<IncidentsByErrorMsgStatisticsDto> response = requestIncidentsByError();

    assertThat(response).hasSize(2);

    IncidentsByErrorMsgStatisticsDto incidentsByError1 =
        response.stream()
            .filter(x -> Objects.equals(x.getErrorMessage(), TestUtil.ERROR_MSG))
            .findFirst()
            .orElseThrow();
    assertThat(incidentsByError1.getInstancesWithErrorCount()).isEqualTo(2);
    assertThat(incidentsByError1.getProcesses()).hasSize(1);
    assertThat(
            incidentsByError1.getProcesses().stream()
                .map(IncidentByProcessStatisticsDto::getBpmnProcessId)
                .collect(Collectors.toList()))
        .containsExactly(DEMO_BPMN_PROCESS_ID);

    IncidentsByErrorMsgStatisticsDto incidentsByError2 =
        response.stream()
            .filter(x -> Objects.equals(x.getErrorMessage(), ERRMSG_OTHER))
            .findFirst()
            .orElseThrow();
    assertThat(incidentsByError2.getInstancesWithErrorCount()).isEqualTo(2);
    assertThat(incidentsByError2.getProcesses()).hasSize(2);
    assertThat(
            incidentsByError2.getProcesses().stream()
                .map(IncidentByProcessStatisticsDto::getBpmnProcessId)
                .collect(Collectors.toList()))
        .containsExactlyInAnyOrder(DEMO_BPMN_PROCESS_ID, DEMO_BPMN_PROCESS_ID);
  }

  @Test
  public void testIncidentsByErrorWithPermisssionWhenOnlyOrderProcessAllowed() throws Exception {

    // given
    createData();

    // when
    when(permissionsService.getProcessesWithPermission(IdentityPermission.READ))
        .thenReturn(PermissionsService.ResourcesAllowed.withIds(Set.of(ORDER_BPMN_PROCESS_ID)));

    // then
    List<IncidentsByErrorMsgStatisticsDto> response = requestIncidentsByError();

    assertThat(response).hasSize(1);

    IncidentsByErrorMsgStatisticsDto incidentsByError1 =
        response.stream()
            .filter(x -> Objects.equals(x.getErrorMessage(), TestUtil.ERROR_MSG))
            .findFirst()
            .orElseThrow();
    // TODO: Check
    assertThat(incidentsByError1.getInstancesWithErrorCount()).isEqualTo(1);
    assertThat(incidentsByError1.getProcesses()).hasSize(1);
    assertThat(
            incidentsByError1.getProcesses().stream()
                .map(IncidentByProcessStatisticsDto::getBpmnProcessId)
                .collect(Collectors.toList()))
        .containsExactly(ORDER_BPMN_PROCESS_ID);
  }

  private void assertNoInstancesProcess(IncidentByProcessStatisticsDto process, int version) {
    assertThat(process.getVersion()).isEqualTo(version);
    assertThat(process.getActiveInstancesCount()).isEqualTo(0);
    assertThat(process.getInstancesWithActiveIncidentsCount()).isEqualTo(0);
    assertThat(process.getBpmnProcessId()).isEqualTo(NO_INSTANCES_PROCESS_ID);
    assertThat(process.getTenantId()).isEqualTo(tenantId2);
    assertThat(process.getName()).isEqualTo(NO_INSTANCES_PROCESS_NAME + version);
  }

  private void assertLoanProcess(IncidentsByProcessGroupStatisticsDto loanProcessGroup) {
    assertThat(loanProcessGroup.getBpmnProcessId()).isEqualTo(LOAN_BPMN_PROCESS_ID);
    assertThat(loanProcessGroup.getTenantId()).isEqualTo(tenantId1);
    assertThat(loanProcessGroup.getProcessName()).isEqualTo(LOAN_PROCESS_NAME + "1");
    assertThat(loanProcessGroup.getActiveInstancesCount()).isEqualTo(5);
    assertThat(loanProcessGroup.getInstancesWithActiveIncidentsCount()).isEqualTo(0);
    assertThat(loanProcessGroup.getProcesses()).hasSize(1);

    // assert Loan process version 1
    assertThat(loanProcessGroup.getProcesses()).hasSize(1);
    IncidentByProcessStatisticsDto loanProcessProcessStatistic =
        loanProcessGroup.getProcesses().iterator().next();
    assertThat(loanProcessProcessStatistic.getName()).isEqualTo(LOAN_PROCESS_NAME + "1");
    assertThat(loanProcessProcessStatistic.getBpmnProcessId()).isEqualTo(LOAN_BPMN_PROCESS_ID);
    assertThat(loanProcessProcessStatistic.getTenantId()).isEqualTo(tenantId1);
    assertThat(loanProcessProcessStatistic.getVersion()).isEqualTo(1);
    assertThat(loanProcessProcessStatistic.getActiveInstancesCount()).isEqualTo(5);
    assertThat(loanProcessProcessStatistic.getInstancesWithActiveIncidentsCount()).isEqualTo(0);
  }

  private void assertOrderProcess(IncidentsByProcessGroupStatisticsDto orderProcessGroup) {
    // assert Order process group
    assertThat(orderProcessGroup.getBpmnProcessId()).isEqualTo(ORDER_BPMN_PROCESS_ID);
    assertThat(orderProcessGroup.getTenantId()).isEqualTo(tenantId2);
    assertThat(orderProcessGroup.getProcessName()).isEqualTo(ORDER_PROCESS_NAME + "2");
    assertThat(orderProcessGroup.getActiveInstancesCount()).isEqualTo(8);
    assertThat(orderProcessGroup.getInstancesWithActiveIncidentsCount()).isEqualTo(1);
    assertThat(orderProcessGroup.getProcesses()).hasSize(2);
    // assert Order process version 2
    final IncidentByProcessStatisticsDto orderProcess =
        orderProcessGroup.getProcesses().iterator().next();
    assertThat(orderProcess.getName()).isEqualTo(ORDER_PROCESS_NAME + "2");
    assertThat(orderProcess.getBpmnProcessId()).isEqualTo(ORDER_BPMN_PROCESS_ID);
    assertThat(orderProcess.getTenantId()).isEqualTo(tenantId2);
    assertThat(orderProcess.getVersion()).isEqualTo(2);
    assertThat(orderProcess.getActiveInstancesCount()).isEqualTo(3);
    assertThat(orderProcess.getInstancesWithActiveIncidentsCount()).isEqualTo(1);
  }

  private void assertDemoProcess(IncidentsByProcessGroupStatisticsDto demoProcessGroup) {
    // assert Demo process group
    assertThat(demoProcessGroup.getBpmnProcessId()).isEqualTo(DEMO_BPMN_PROCESS_ID);
    assertThat(demoProcessGroup.getTenantId()).isEqualTo(tenantId1);
    assertThat(demoProcessGroup.getProcessName()).isEqualTo(DEMO_PROCESS_NAME + "2");
    assertThat(demoProcessGroup.getActiveInstancesCount()).isEqualTo(9);
    assertThat(demoProcessGroup.getInstancesWithActiveIncidentsCount()).isEqualTo(4);
    assertThat(demoProcessGroup.getProcesses()).hasSize(2);
    // assert Demo process version 1
    final Iterator<IncidentByProcessStatisticsDto> processes =
        demoProcessGroup.getProcesses().iterator();
    final IncidentByProcessStatisticsDto process1 = processes.next();
    assertThat(process1.getName()).isEqualTo(DEMO_PROCESS_NAME + "1");
    assertThat(process1.getBpmnProcessId()).isEqualTo(DEMO_BPMN_PROCESS_ID);
    assertThat(process1.getTenantId()).isEqualTo(tenantId1);
    assertThat(process1.getVersion()).isEqualTo(1);
    assertThat(process1.getActiveInstancesCount()).isEqualTo(3);
    assertThat(process1.getInstancesWithActiveIncidentsCount()).isEqualTo(3);
    // assert Demo process version 2
    final IncidentByProcessStatisticsDto process2 = processes.next();
    assertThat(process2.getName()).isEqualTo(DEMO_PROCESS_NAME + "2");
    assertThat(process2.getBpmnProcessId()).isEqualTo(DEMO_BPMN_PROCESS_ID);
    assertThat(process2.getTenantId()).isEqualTo(tenantId1);
    assertThat(process2.getVersion()).isEqualTo(2);
    assertThat(process2.getActiveInstancesCount()).isEqualTo(6);
    assertThat(process2.getInstancesWithActiveIncidentsCount()).isEqualTo(1);
  }

  private void createDemoProcessData() {
    List<ProcessEntity> processVersions =
        createProcessVersions(DEMO_BPMN_PROCESS_ID, DEMO_PROCESS_NAME, 2, tenantId1);
    searchTestRule.persistNew(processVersions.toArray(new OperateEntity[processVersions.size()]));

    List<OperateEntity> entities = new ArrayList<>();

    // Demo process v1
    Long processDefinitionKey = processVersions.get(0).getKey();
    // instance #1
    ProcessInstanceForListViewEntity processInstance =
        createProcessInstanceEntity(
            ProcessInstanceState.ACTIVE, processDefinitionKey, DEMO_BPMN_PROCESS_ID, true);
    entities.add(processInstance);
    entities.addAll(createIncidents(processInstance, 1, 1));
    // instance #2
    processInstance =
        createProcessInstanceEntity(
            ProcessInstanceState.ACTIVE, processDefinitionKey, DEMO_BPMN_PROCESS_ID, true);
    entities.add(processInstance);
    entities.addAll(createIncidents(processInstance, 1, 1, true));
    // instance #3
    processInstance =
        createProcessInstanceEntity(
            ProcessInstanceState.ACTIVE, processDefinitionKey, DEMO_BPMN_PROCESS_ID, true);
    entities.add(processInstance);
    entities.addAll(createIncidents(processInstance, 1, 0));
    // entities #4,5,6
    for (int i = 4; i <= 6; i++) {
      entities.add(
          createProcessInstanceEntity(
              ProcessInstanceState.ACTIVE, processDefinitionKey, DEMO_BPMN_PROCESS_ID));
    }

    // Demo process v2
    processDefinitionKey = processVersions.get(1).getKey();
    // instance #1
    processInstance =
        createProcessInstanceEntity(
            ProcessInstanceState.ACTIVE, processDefinitionKey, DEMO_BPMN_PROCESS_ID, true);
    entities.add(processInstance);
    entities.addAll(createIncidents(processInstance, 2, 0, true));
    // entities #2-7
    for (int i = 2; i <= 7; i++) {
      entities.add(
          createProcessInstanceEntity(
              ProcessInstanceState.ACTIVE, processDefinitionKey, DEMO_BPMN_PROCESS_ID));
    }
    // entities #8-9
    for (int i = 8; i <= 9; i++) {
      entities.add(
          createProcessInstanceEntity(
              ProcessInstanceState.COMPLETED, processDefinitionKey, DEMO_BPMN_PROCESS_ID));
    }

    searchTestRule.persistNew(entities.toArray(new OperateEntity[entities.size()]));
  }

  private void createOrderProcessData() {
    List<ProcessEntity> processVersions =
        createProcessVersions(ORDER_BPMN_PROCESS_ID, ORDER_PROCESS_NAME, 2, tenantId2);
    searchTestRule.persistNew(processVersions.toArray(new OperateEntity[processVersions.size()]));

    List<OperateEntity> entities = new ArrayList<>();
    // Order process v1
    Long processDefinitionKey = processVersions.get(0).getKey();
    // entities #1-5
    for (int i = 1; i <= 5; i++) {
      entities.add(
          createProcessInstanceEntity(
              ProcessInstanceState.ACTIVE, processDefinitionKey, ORDER_BPMN_PROCESS_ID));
    }

    // Order process v2
    processDefinitionKey = processVersions.get(1).getKey();
    // instance #1
    ProcessInstanceForListViewEntity processInstance =
        createProcessInstanceEntity(
            ProcessInstanceState.ACTIVE, processDefinitionKey, ORDER_BPMN_PROCESS_ID);
    entities.add(processInstance);
    entities.addAll(createIncidents(processInstance, 0, 1));
    // instance #2
    processInstance =
        createProcessInstanceEntity(
            ProcessInstanceState.ACTIVE, processDefinitionKey, ORDER_BPMN_PROCESS_ID, true);
    entities.add(processInstance);
    entities.addAll(createIncidents(processInstance, 2, 0));
    // entities #3,4
    for (int i = 3; i <= 4; i++) {
      entities.add(
          createProcessInstanceEntity(
              ProcessInstanceState.ACTIVE, processDefinitionKey, ORDER_BPMN_PROCESS_ID));
    }

    searchTestRule.persistNew(entities.toArray(new OperateEntity[entities.size()]));
  }

  private void createLoanProcessData() {
    // Loan process v1
    List<ProcessEntity> processVersions =
        createProcessVersions(LOAN_BPMN_PROCESS_ID, LOAN_PROCESS_NAME, 1, tenantId1);
    searchTestRule.persistNew(processVersions.get(0));

    List<OperateEntity> entities = new ArrayList<>();
    Long processDefinitionKey = processVersions.get(0).getKey();
    // entities #1-3
    for (int i = 1; i <= 3; i++) {
      ProcessInstanceForListViewEntity processInstance =
          createProcessInstanceEntity(
              ProcessInstanceState.ACTIVE, processDefinitionKey, LOAN_BPMN_PROCESS_ID);
      entities.add(processInstance);
      entities.addAll(createIncidents(processInstance, 0, 2));
    }
    // entities #4-5
    for (int i = 4; i <= 5; i++) {
      entities.add(
          createProcessInstanceEntity(
              ProcessInstanceState.ACTIVE, processDefinitionKey, LOAN_BPMN_PROCESS_ID));
    }

    searchTestRule.persistNew(entities.toArray(new OperateEntity[entities.size()]));
  }

  private void createNoInstancesProcessData(int versionCount) {
    createProcessVersions(
            NO_INSTANCES_PROCESS_ID, NO_INSTANCES_PROCESS_NAME, versionCount, tenantId2)
        .forEach(processVersion -> searchTestRule.persistNew(processVersion));
  }

  private List<IncidentsByProcessGroupStatisticsDto> requestIncidentsByProcess() throws Exception {
    return mockMvcTestRule.listFromResponse(
        getRequest(QUERY_INCIDENTS_BY_PROCESS_URL), IncidentsByProcessGroupStatisticsDto.class);
  }

  private List<IncidentsByErrorMsgStatisticsDto> requestIncidentsByError() throws Exception {
    return mockMvcTestRule.listFromResponse(
        getRequest(QUERY_INCIDENTS_BY_ERROR_URL), IncidentsByErrorMsgStatisticsDto.class);
  }

  /**
   * Demo process v1 - 6 running instances: 3 active incidents, 2 resolved Demo process v2 - 2
   * finished instances, 7 running: 2 active in 1 inst, 0 resolved Order process v1 - 5 running
   * instances: no incidents Order process v2 - 4 running instances: 2 active in 1 inst, 1 resolved
   * Loan process v1 - 5 running instances: 0 active, 6 resolved
   */
  private void createData() {
    createDemoProcessData();
    createOrderProcessData();
    createLoanProcessData();
  }

  private List<OperateEntity> createIncidents(
      ProcessInstanceForListViewEntity processInstance,
      int activeIncidentsCount,
      int resolvedIncidentsCount) {
    return createIncidents(processInstance, activeIncidentsCount, resolvedIncidentsCount, false);
  }

  private List<OperateEntity> createIncidents(
      ProcessInstanceForListViewEntity processInstance,
      int activeIncidentsCount,
      int resolvedIncidentsCount,
      boolean withOtherMsg) {
    List<OperateEntity> entities = new ArrayList<>();
    for (int i = 0; i < activeIncidentsCount; i++) {
      final FlowNodeInstanceForListViewEntity activityInstance =
          TestUtil.createFlowNodeInstance(
              processInstance.getProcessInstanceKey(), FlowNodeState.ACTIVE);
      createIncident(activityInstance, withOtherMsg ? ERRMSG_OTHER : null);
      entities.add(activityInstance);
      IncidentEntity incidentEntity =
          TestUtil.createIncident(
              IncidentState.ACTIVE,
              activityInstance.getActivityId(),
              Long.valueOf(activityInstance.getId()),
              activityInstance.getErrorMessage());
      incidentEntity.setProcessDefinitionKey(processInstance.getProcessDefinitionKey());
      incidentEntity.setProcessInstanceKey(processInstance.getProcessInstanceKey());
      incidentEntity.setBpmnProcessId(processInstance.getBpmnProcessId());
      entities.add(incidentEntity);
    }
    for (int i = 0; i < resolvedIncidentsCount; i++) {
      final FlowNodeInstanceForListViewEntity activityInstance =
          TestUtil.createFlowNodeInstance(
              processInstance.getProcessInstanceKey(), FlowNodeState.ACTIVE);
      entities.add(activityInstance);
    }
    int pendingIncidentsCount = random.nextInt(5) + 1;
    for (int i = 0; i < pendingIncidentsCount; i++) {
      final FlowNodeInstanceForListViewEntity activityInstance =
          TestUtil.createFlowNodeInstance(
              processInstance.getProcessInstanceKey(), FlowNodeState.ACTIVE);
      createIncident(activityInstance, withOtherMsg ? ERRMSG_OTHER : null);
      entities.add(activityInstance);
      IncidentEntity incidentEntity =
          TestUtil.createIncident(
              IncidentState.ACTIVE,
              activityInstance.getActivityId(),
              Long.valueOf(activityInstance.getId()),
              activityInstance.getErrorMessage());
      incidentEntity.setProcessDefinitionKey(processInstance.getProcessDefinitionKey());
      incidentEntity.setProcessInstanceKey(processInstance.getProcessInstanceKey());
      incidentEntity.setBpmnProcessId(processInstance.getBpmnProcessId());
      incidentEntity.setState(IncidentState.PENDING);
      entities.add(incidentEntity);
    }
    return entities;
  }
}
