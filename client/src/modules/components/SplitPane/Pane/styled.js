import styled, {css} from 'styled-components';

import Panel from 'modules/components/Panel';
import ExpandButton from 'modules/components/ExpandButton';
import {EXPAND_STATE} from 'modules/constants';

const isCollapsed = expandState => expandState === EXPAND_STATE.COLLAPSED;

export const Pane = styled(Panel)`
  ${({expandState}) => (isCollapsed(expandState) ? '' : `flex-grow: 1;`)};
`;

const collapsedStyle = css`
  display: none;
`;

export const Body = styled(Panel.Body)`
  ${({expandState}) => (isCollapsed(expandState) ? collapsedStyle : '')};
`;

export const Footer = styled(Panel.Footer)`
  ${({expandState}) => (isCollapsed(expandState) ? collapsedStyle : '')};
`;

export const PaneExpandButton = styled(ExpandButton)`
  border-top: none;
  border-bottom: none;
  border-right: none;
`;

export const ButtonsContainer = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  z-index: 2;
`;
