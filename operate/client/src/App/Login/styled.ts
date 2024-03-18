/*
 * Copyright Camunda Services GmbH
 *
 * BY INSTALLING, DOWNLOADING, ACCESSING, USING, OR DISTRIBUTING THE SOFTWARE ("USE"), YOU INDICATE YOUR ACCEPTANCE TO AND ARE ENTERING INTO A CONTRACT WITH, THE LICENSOR ON THE TERMS SET OUT IN THIS AGREEMENT. IF YOU DO NOT AGREE TO THESE TERMS, YOU MUST NOT USE THE SOFTWARE. IF YOU ARE RECEIVING THE SOFTWARE ON BEHALF OF A LEGAL ENTITY, YOU REPRESENT AND WARRANT THAT YOU HAVE THE ACTUAL AUTHORITY TO AGREE TO THE TERMS AND CONDITIONS OF THIS AGREEMENT ON BEHALF OF SUCH ENTITY.
 * "Licensee" means you, an individual, or the entity on whose behalf you receive the Software.
 *
 * Permission is hereby granted, free of charge, to the Licensee obtaining a copy of this Software and associated documentation files to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject in each case to the following conditions:
 * Condition 1: If the Licensee distributes the Software or any derivative works of the Software, the Licensee must attach this Agreement.
 * Condition 2: Without limiting other conditions in this Agreement, the grant of rights is solely for non-production use as defined below.
 * "Non-production use" means any use of the Software that is not directly related to creating products, services, or systems that generate revenue or other direct or indirect economic benefits.  Examples of permitted non-production use include personal use, educational use, research, and development. Examples of prohibited production use include, without limitation, use for commercial, for-profit, or publicly accessible systems or use for commercial or revenue-generating purposes.
 *
 * If the Licensee is in breach of the Conditions, this Agreement, including the rights granted under it, will automatically terminate with immediate effect.
 *
 * SUBJECT AS SET OUT BELOW, THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 * NOTHING IN THIS AGREEMENT EXCLUDES OR RESTRICTS A PARTY’S LIABILITY FOR (A) DEATH OR PERSONAL INJURY CAUSED BY THAT PARTY’S NEGLIGENCE, (B) FRAUD, OR (C) ANY OTHER LIABILITY TO THE EXTENT THAT IT CANNOT BE LAWFULLY EXCLUDED OR RESTRICTED.
 */

import styled from 'styled-components';

import {styles, rem} from '@carbon/elements';
import {ReactComponent as BaseLogo} from 'modules/components/Icon/logo.svg';
import {Button as BaseButton} from '@carbon/react';

const Button: typeof BaseButton = styled(BaseButton)`
  min-width: 100%;
  margin-top: var(--cds-spacing-05);
`;

const Container = styled.main`
  height: 100%;
  padding: var(--cds-spacing-03);
`;

const CopyrightNotice = styled.span`
  color: var(--cds-text-secondary);
  text-align: center;
  align-self: end;
  ${styles.legal01};
`;

const LogoContainer = styled.div`
  text-align: center;
  padding-top: var(--cds-spacing-12);
  padding-bottom: var(--cds-spacing-02);
`;

const Error = styled.span`
  min-height: calc(${rem(48)} + var(--cds-spacing-06));
  padding-bottom: var(--cds-spacing-06);
`;

const FieldContainer = styled.div`
  min-height: ${rem(84)};
`;

const CamundaLogo = styled(BaseLogo)`
  color: var(--cds-icon-primary);
`;

const Title = styled.h1`
  padding-bottom: var(--cds-spacing-10);
  text-align: center;
  color: var(--cds-text-primary);
  ${styles.productiveHeading05};
`;

export {
  Container,
  CopyrightNotice,
  LogoContainer,
  Error,
  FieldContainer,
  CamundaLogo,
  Title,
  Button,
};