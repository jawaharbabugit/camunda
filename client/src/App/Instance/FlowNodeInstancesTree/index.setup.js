/*
 * Copyright Camunda Services GmbH and/or licensed to Camunda Services GmbH
 * under one or more contributor license agreements. Licensed under a commercial license.
 * You may not use this file except in compliance with the commercial license.
 */

const DIAGRAM = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" xmlns:zeebe="http://camunda.org/schema/zeebe/1.0" id="Definitions_1kgscet" targetNamespace="http://bpmn.io/schema/bpmn" exporter="Camunda Modeler" exporterVersion="1.16.0">
  <bpmn:process id="multiInstanceProcess" name="Multi-Instance Process" isExecutable="true">
    <bpmn:startEvent id="start" name="Start">
      <bpmn:outgoing>SequenceFlow_0ywev43</bpmn:outgoing>
    </bpmn:startEvent>
    <bpmn:sequenceFlow id="SequenceFlow_0ywev43" sourceRef="start" targetRef="peterFork" />
    <bpmn:parallelGateway id="peterFork" name="Peter Fork">
      <bpmn:incoming>SequenceFlow_0ywev43</bpmn:incoming>
      <bpmn:outgoing>SequenceFlow_0rzup48</bpmn:outgoing>
      <bpmn:outgoing>SequenceFlow_05xgu65</bpmn:outgoing>
      <bpmn:outgoing>SequenceFlow_09ulah7</bpmn:outgoing>
    </bpmn:parallelGateway>
    <bpmn:exclusiveGateway id="peterJoin" name="Peter Join">
      <bpmn:incoming>SequenceFlow_0rzup48</bpmn:incoming>
      <bpmn:incoming>SequenceFlow_05xgu65</bpmn:incoming>
      <bpmn:incoming>SequenceFlow_09ulah7</bpmn:incoming>
      <bpmn:outgoing>SequenceFlow_09pqj2f</bpmn:outgoing>
    </bpmn:exclusiveGateway>
    <bpmn:sequenceFlow id="SequenceFlow_0rzup48" sourceRef="peterFork" targetRef="peterJoin" />
    <bpmn:serviceTask id="reduceTask" name="Reduce">
      <bpmn:extensionElements>
        <zeebe:taskDefinition type="reduce" retries="1" />
      </bpmn:extensionElements>
      <bpmn:incoming>SequenceFlow_0lfp9em</bpmn:incoming>
      <bpmn:outgoing>SequenceFlow_0pynv0i</bpmn:outgoing>
      <bpmn:multiInstanceLoopCharacteristics isSequential="true">
        <bpmn:extensionElements>
          <zeebe:loopCharacteristics inputCollection="=items" inputElement="item" />
        </bpmn:extensionElements>
      </bpmn:multiInstanceLoopCharacteristics>
    </bpmn:serviceTask>
    <bpmn:subProcess id="filterMapSubProcess" name="Filter-Map Sub Process">
      <bpmn:incoming>SequenceFlow_09pqj2f</bpmn:incoming>
      <bpmn:outgoing>SequenceFlow_0lfp9em</bpmn:outgoing>
      <bpmn:multiInstanceLoopCharacteristics>
        <bpmn:extensionElements>
          <zeebe:loopCharacteristics inputCollection="=items" inputElement="item" />
        </bpmn:extensionElements>
      </bpmn:multiInstanceLoopCharacteristics>
      <bpmn:startEvent id="startFilterMap" name="Start&#10;Filter-Map">
        <bpmn:outgoing>SequenceFlow_1denv3y</bpmn:outgoing>
      </bpmn:startEvent>
      <bpmn:serviceTask id="filterTask" name="Filter">
        <bpmn:extensionElements>
          <zeebe:taskDefinition type="filter" retries="1" />
        </bpmn:extensionElements>
        <bpmn:incoming>SequenceFlow_1denv3y</bpmn:incoming>
        <bpmn:outgoing>SequenceFlow_1vxqfdy</bpmn:outgoing>
      </bpmn:serviceTask>
      <bpmn:sequenceFlow id="SequenceFlow_1denv3y" sourceRef="startFilterMap" targetRef="filterTask" />
      <bpmn:serviceTask id="mapTask" name="Map">
        <bpmn:extensionElements>
          <zeebe:taskDefinition type="map" retries="1" />
        </bpmn:extensionElements>
        <bpmn:incoming>SequenceFlow_1vxqfdy</bpmn:incoming>
        <bpmn:outgoing>SequenceFlow_106qs66</bpmn:outgoing>
      </bpmn:serviceTask>
      <bpmn:sequenceFlow id="SequenceFlow_1vxqfdy" sourceRef="filterTask" targetRef="mapTask" />
      <bpmn:endEvent id="endFilterMap" name="End&#10;FilterMap&#10;">
        <bpmn:incoming>SequenceFlow_106qs66</bpmn:incoming>
      </bpmn:endEvent>
      <bpmn:sequenceFlow id="SequenceFlow_106qs66" sourceRef="mapTask" targetRef="endFilterMap" />
    </bpmn:subProcess>
    <bpmn:endEvent id="end" name="End">
      <bpmn:incoming>SequenceFlow_0pynv0i</bpmn:incoming>
    </bpmn:endEvent>
    <bpmn:sequenceFlow id="SequenceFlow_05xgu65" sourceRef="peterFork" targetRef="peterJoin" />
    <bpmn:sequenceFlow id="SequenceFlow_09ulah7" sourceRef="peterFork" targetRef="peterJoin" />
    <bpmn:sequenceFlow id="SequenceFlow_0lfp9em" sourceRef="filterMapSubProcess" targetRef="reduceTask" />
    <bpmn:sequenceFlow id="SequenceFlow_09pqj2f" sourceRef="peterJoin" targetRef="filterMapSubProcess" />
    <bpmn:sequenceFlow id="SequenceFlow_0pynv0i" sourceRef="reduceTask" targetRef="end" />
    <bpmn:textAnnotation id="TextAnnotation_077lfkg">
      <bpmn:text>Fork to simulate peter case</bpmn:text>
    </bpmn:textAnnotation>
    <bpmn:association id="Association_1bsuyxn" sourceRef="peterFork" targetRef="TextAnnotation_077lfkg" />
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="multiInstanceProcess">
      <bpmndi:BPMNShape id="_BPMNShape_StartEvent_2" bpmnElement="start">
        <dc:Bounds x="179" y="159" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="186" y="202" width="24" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="SequenceFlow_0ywev43_di" bpmnElement="SequenceFlow_0ywev43">
        <di:waypoint x="215" y="177" />
        <di:waypoint x="263" y="177" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNShape id="ParallelGateway_195w4tj_di" bpmnElement="peterFork">
        <dc:Bounds x="263" y="152" width="50" height="50" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="230" y="206" width="53" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="ExclusiveGateway_00qjrsu_di" bpmnElement="peterJoin" isMarkerVisible="true">
        <dc:Bounds x="380" y="152" width="50" height="50" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="343" y="207" width="50" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="SequenceFlow_0rzup48_di" bpmnElement="SequenceFlow_0rzup48">
        <di:waypoint x="313" y="177" />
        <di:waypoint x="380" y="177" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNShape id="ServiceTask_19tlu7r_di" bpmnElement="reduceTask">
        <dc:Bounds x="979" y="137" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="SubProcess_0wql3ps_di" bpmnElement="filterMapSubProcess" isExpanded="true">
        <dc:Bounds x="508" y="77" width="399" height="200" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="EndEvent_1kwl5m7_di" bpmnElement="end">
        <dc:Bounds x="1139" y="159" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1147" y="202" width="20" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="StartEvent_11uxmcd_di" bpmnElement="startFilterMap">
        <dc:Bounds x="529" y="155" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="525" y="198" width="50" height="27" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="ServiceTask_0bw8npn_di" bpmnElement="filterTask">
        <dc:Bounds x="601" y="133" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="SequenceFlow_1denv3y_di" bpmnElement="SequenceFlow_1denv3y">
        <di:waypoint x="565" y="173" />
        <di:waypoint x="601" y="173" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNShape id="ServiceTask_1c90zv4_di" bpmnElement="mapTask">
        <dc:Bounds x="735" y="133" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="SequenceFlow_1vxqfdy_di" bpmnElement="SequenceFlow_1vxqfdy">
        <di:waypoint x="701" y="173" />
        <di:waypoint x="735" y="173" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNShape id="EndEvent_1r5xmm2_di" bpmnElement="endFilterMap">
        <dc:Bounds x="856" y="155" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="852" y="198" width="47" height="40" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="SequenceFlow_106qs66_di" bpmnElement="SequenceFlow_106qs66">
        <di:waypoint x="835" y="173" />
        <di:waypoint x="856" y="173" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="SequenceFlow_05xgu65_di" bpmnElement="SequenceFlow_05xgu65">
        <di:waypoint x="288" y="177" />
        <di:waypoint x="288" y="268" />
        <di:waypoint x="405" y="268" />
        <di:waypoint x="405" y="202" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="SequenceFlow_09ulah7_di" bpmnElement="SequenceFlow_09ulah7">
        <di:waypoint x="288" y="152" />
        <di:waypoint x="288" y="86" />
        <di:waypoint x="405" y="86" />
        <di:waypoint x="405" y="152" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNShape id="TextAnnotation_077lfkg_di" bpmnElement="TextAnnotation_077lfkg">
        <dc:Bounds x="176" y="12" width="100" height="40" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="Association_1bsuyxn_di" bpmnElement="Association_1bsuyxn">
        <di:waypoint x="281" y="159" />
        <di:waypoint x="235" y="52" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="SequenceFlow_0lfp9em_di" bpmnElement="SequenceFlow_0lfp9em">
        <di:waypoint x="907" y="177" />
        <di:waypoint x="979" y="177" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="SequenceFlow_09pqj2f_di" bpmnElement="SequenceFlow_09pqj2f">
        <di:waypoint x="430" y="177" />
        <di:waypoint x="508" y="177" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="SequenceFlow_0pynv0i_di" bpmnElement="SequenceFlow_0pynv0i">
        <di:waypoint x="1079" y="177" />
        <di:waypoint x="1139" y="177" />
      </bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>
`;

const CURRENT_INSTANCE = Object.freeze({
  id: '2251799813686118',
  workflowId: '2251799813686038',
  workflowName: 'Multi-Instance Process',
  workflowVersion: 1,
  startDate: '2020-08-18T12:07:33.854+0000',
  endDate: null,
  state: 'INCIDENT',
  bpmnProcessId: 'multiInstanceProcess',
  hasActiveOperation: false,
  operations: [],
});

const mockNode = Object.freeze({
  children: [
    {
      id: '2251799813686130',
      type: 'PARALLEL_GATEWAY',
      state: 'COMPLETED',
      activityId: 'peterFork',
      startDate: '2020-08-18T12:07:33.953+0000',
      endDate: '2020-08-18T12:07:34.034+0000',
      parentId: '2251799813686118',
      children: [],
    },
    {
      id: '2251799813686156',
      type: 'MULTI_INSTANCE_BODY',
      state: 'INCIDENT',
      activityId: 'filterMapSubProcess',
      startDate: '2020-08-18T12:07:34.205+0000',
      endDate: null,
      parentId: '2251799813686118',
      children: [
        {
          id: '2251799813686166',
          type: 'SUB_PROCESS',
          state: 'INCIDENT',
          activityId: 'filterMapSubProcess',
          startDate: '2020-08-18T12:07:34.281+0000',
          endDate: null,
          parentId: '2251799813686156',
          children: [
            {
              id: '2251799813686204',
              type: 'START_EVENT',
              state: 'COMPLETED',
              activityId: 'startFilterMap',
              startDate: '2020-08-18T12:07:34.337+0000',
              endDate: '2020-08-18T12:07:34.445+0000',
              parentId: '2251799813686166',
              children: [],
            },
          ],
        },
      ],
    },
  ],
  id: '2251799813686118',
  type: 'WORKFLOW',
  state: 'INCIDENT',
});

export {DIAGRAM, CURRENT_INSTANCE, mockNode};
