/*
 * Copyright Camunda Services GmbH and/or licensed to Camunda Services GmbH
 * under one or more contributor license agreements. Licensed under a commercial license.
 * You may not use this file except in compliance with the commercial license.
 */

import React, {Fragment} from 'react';
import PropTypes from 'prop-types';

import CollapsablePanel from 'modules/components/CollapsablePanel';
import Badge from 'modules/components/Badge';
import Button from 'modules/components/Button';
import Input from 'modules/components/Input';
import {
  DEFAULT_FILTER,
  FILTER_TYPES,
  DEFAULT_FILTER_CONTROLLED_VALUES,
  DIRECTION,
  BADGE_TYPE
} from 'modules/constants';
import {CollapsablePanelConsumer} from 'modules/contexts/CollapsablePanelContext';
import {isEqual, isEmpty} from 'lodash';

import * as Styled from './styled';
import {
  getOptionsForWorkflowName,
  getOptionsForWorkflowVersion,
  addAllVersionsOption,
  getLastVersionOfWorkflow,
  checkIsDateComplete,
  checkIsDateValid,
  checkIsVariableNameComplete,
  checkIsVariableValueComplete,
  checkIsVariableValueValid,
  checkIsIdComplete,
  checkIsIdValid,
  sortAndModify,
  sanitizeFilter
} from './service';

import {ALL_VERSIONS_OPTION, DEBOUNCE_DELAY} from './constants';

export default class Filters extends React.Component {
  static propTypes = {
    filter: PropTypes.shape({
      active: PropTypes.bool.isRequired,
      activityId: PropTypes.string.isRequired,
      canceled: PropTypes.bool.isRequired,
      completed: PropTypes.bool.isRequired,
      endDate: PropTypes.string.isRequired,
      errorMessage: PropTypes.string.isRequired,
      ids: PropTypes.string.isRequired,
      incidents: PropTypes.bool.isRequired,
      startDate: PropTypes.string.isRequired,
      version: PropTypes.string.isRequired,
      workflow: PropTypes.string.isRequired,
      variable: PropTypes.shape({
        name: PropTypes.string,
        value: PropTypes.string
      }).isRequired
    }).isRequired,
    filterCount: PropTypes.number.isRequired,
    onFilterChange: PropTypes.func.isRequired,
    onFilterReset: PropTypes.func.isRequired,
    selectableFlowNodes: PropTypes.arrayOf(PropTypes.object),
    groupedWorkflows: PropTypes.object
  };

  state = {
    filter: {
      active: false,
      incidents: false,
      completed: false,
      canceled: false,
      ids: '',
      errorMessage: '',
      startDate: '',
      endDate: '',
      activityId: '',
      version: '',
      workflow: '',
      variable: {name: '', value: ''}
    }
  };

  componentDidMount = async () => {
    this.setFilterFromProps();
  };

  componentDidUpdate = (prevProps, prevState) => {
    if (!isEqual(prevProps.filter, this.props.filter)) {
      this.setFilterFromProps();
    }
  };

  componentWillUnmount = () => {
    this.resetTimer();
  };

  timer = null;

  resetTimer = () => {
    clearTimeout(this.timer);
  };

  waitForTimer = async fct => {
    await this.timeout();
    fct();
  };

  timeout = () => {
    const timerPromise = resolve => {
      this.resetTimer();
      this.timer = setTimeout(resolve, DEBOUNCE_DELAY);
    };

    return new Promise(timerPromise);
  };

  setFilterState = (filter, callback = () => {}) => {
    this.setState(
      {
        filter: {
          ...this.state.filter,
          ...filter
        }
      },
      callback
    );
  };

  propagateFilter = () => {
    this.props.onFilterChange(sanitizeFilter(this.state.filter));
  };

  setFilterFromProps = () => {
    this.setFilterState(sanitizeFilter(this.props.filter));
  };

  handleWorkflowNameChange = event => {
    const {value} = event.target;
    const currentWorkflow = this.props.groupedWorkflows[value];
    const version = getLastVersionOfWorkflow(currentWorkflow);

    this.setFilterState(
      {workflow: value, version, activityId: ''},
      this.propagateFilter
    );
  };

  handleWorkflowVersionChange = event => {
    const {value} = event.target;

    if (value === '') {
      return;
    }

    this.setFilterState({version: value, activityId: ''}, this.propagateFilter);
  };

  handleControlledInputChange = (event, callback) => {
    const {value, name} = event.target;

    this.setFilterState(
      {
        [name]: value
      },
      callback
    );
  };

  handleVariableChange = status => {
    this.setFilterState({variable: status});
  };

  onFilterReset = () => {
    this.resetTimer();
    this.setFilterState(
      {...DEFAULT_FILTER_CONTROLLED_VALUES, ...DEFAULT_FILTER},
      this.props.onFilterReset
    );
  };

  render() {
    const {active, incidents, canceled, completed} = this.state.filter;
    const isWorkflowsDataLoaded = !isEmpty(this.props.groupedWorkflows);
    const workflowVersions =
      this.state.filter.workflow !== '' && isWorkflowsDataLoaded
        ? addAllVersionsOption(
            getOptionsForWorkflowVersion(
              this.props.groupedWorkflows[this.state.filter.workflow].workflows
            )
          )
        : [];

    return (
      <CollapsablePanelConsumer>
        {context => (
          <CollapsablePanel
            isCollapsed={context.isFiltersCollapsed}
            onCollapse={context.toggleFilters}
            maxWidth={328}
            expandButton={
              <Styled.VerticalButton label="Filters">
                <Badge type={BADGE_TYPE.FILTERS}>
                  {this.props.filterCount}
                </Badge>
              </Styled.VerticalButton>
            }
            collapseButton={
              <Styled.CollapseButton
                direction={DIRECTION.LEFT}
                isExpanded={true}
                title="Collapse Filters"
              />
            }
          >
            <Styled.FiltersHeader>
              Filters
              <Badge type={BADGE_TYPE.FILTERS}>{this.props.filterCount}</Badge>
            </Styled.FiltersHeader>
            <Styled.FiltersBody>
              <Styled.Filters>
                <Fragment>
                  <Styled.Field>
                    <Styled.Select
                      value={this.state.filter.workflow}
                      disabled={isEmpty(this.props.groupedWorkflows)}
                      name="workflow"
                      placeholder="Workflow"
                      options={getOptionsForWorkflowName(
                        this.props.groupedWorkflows
                      )}
                      onChange={this.handleWorkflowNameChange}
                    />
                  </Styled.Field>
                  <Styled.Field>
                    <Styled.Select
                      value={this.state.filter.version}
                      disabled={this.state.filter.workflow === ''}
                      name="version"
                      placeholder="Workflow Version"
                      options={workflowVersions}
                      onChange={this.handleWorkflowVersionChange}
                    />
                  </Styled.Field>
                  <Styled.Field>
                    <Styled.ValidationTextInput
                      value={this.state.filter.ids}
                      name="ids"
                      placeholder="Instance Id(s) separated by space or comma"
                      onChange={this.handleControlledInputChange}
                      checkIsComplete={checkIsIdComplete}
                      checkIsValid={checkIsIdValid}
                      onFilterChange={() =>
                        this.waitForTimer(this.propagateFilter)
                      }
                    >
                      <Styled.Textarea />
                    </Styled.ValidationTextInput>
                  </Styled.Field>
                  <Styled.Field>
                    <Styled.ValidationTextInput
                      value={this.state.filter.errorMessage}
                      name="errorMessage"
                      placeholder="Error Message"
                      onChange={this.handleControlledInputChange}
                      onFilterChange={() =>
                        this.waitForTimer(this.propagateFilter)
                      }
                    >
                      <Input />
                    </Styled.ValidationTextInput>
                  </Styled.Field>
                  <Styled.Field>
                    <Styled.ValidationTextInput
                      value={this.state.filter.startDate}
                      name="startDate"
                      placeholder="Start Date yyyy-mm-dd hh:mm:ss"
                      onChange={this.handleControlledInputChange}
                      checkIsComplete={checkIsDateComplete}
                      checkIsValid={checkIsDateValid}
                      onFilterChange={() =>
                        this.waitForTimer(this.propagateFilter)
                      }
                    >
                      <Input />
                    </Styled.ValidationTextInput>
                  </Styled.Field>
                  <Styled.Field>
                    <Styled.ValidationTextInput
                      value={this.state.filter.endDate}
                      name="endDate"
                      placeholder="End Date yyyy-mm-dd hh:mm:ss"
                      onChange={this.handleControlledInputChange}
                      checkIsComplete={checkIsDateComplete}
                      checkIsValid={checkIsDateValid}
                      onFilterChange={() =>
                        this.waitForTimer(this.propagateFilter)
                      }
                    >
                      <Input />
                    </Styled.ValidationTextInput>
                  </Styled.Field>
                  <Styled.Field>
                    <Styled.Select
                      value={this.state.filter.activityId}
                      disabled={
                        this.state.filter.version === '' ||
                        this.state.filter.version === ALL_VERSIONS_OPTION
                      }
                      name="activityId"
                      placeholder="Flow Node"
                      options={sortAndModify(this.props.selectableFlowNodes)}
                      onChange={event =>
                        this.handleControlledInputChange(
                          event,
                          this.propagateFilter
                        )
                      }
                    />
                  </Styled.Field>
                  <Styled.Field>
                    <Styled.VariableFilterInput
                      variable={this.state.filter.variable}
                      onFilterChange={() =>
                        this.waitForTimer(this.propagateFilter)
                      }
                      onChange={this.handleVariableChange}
                      checkIsNameComplete={checkIsVariableNameComplete}
                      checkIsValueComplete={checkIsVariableValueComplete}
                      checkIsValueValid={checkIsVariableValueValid}
                    />
                  </Styled.Field>
                  <Styled.CheckboxGroup
                    type={FILTER_TYPES.RUNNING}
                    filter={{
                      active,
                      incidents
                    }}
                    onChange={status =>
                      this.setFilterState(status, this.propagateFilter)
                    }
                  />
                  <Styled.CheckboxGroup
                    type={FILTER_TYPES.FINISHED}
                    filter={{
                      completed,
                      canceled
                    }}
                    onChange={status =>
                      this.setFilterState(status, this.propagateFilter)
                    }
                  />
                </Fragment>
              </Styled.Filters>
            </Styled.FiltersBody>
            <Styled.ResetButtonContainer>
              <Button
                title="Reset filters"
                disabled={isEqual(this.state.filter, {
                  ...DEFAULT_FILTER_CONTROLLED_VALUES,
                  ...DEFAULT_FILTER
                })}
                onClick={this.onFilterReset}
              >
                Reset Filters
              </Button>
            </Styled.ResetButtonContainer>
            <CollapsablePanel.Footer />
          </CollapsablePanel>
        )}
      </CollapsablePanelConsumer>
    );
  }
}
