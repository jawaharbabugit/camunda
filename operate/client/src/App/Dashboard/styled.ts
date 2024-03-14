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

import styled, {css} from 'styled-components';
import {Tile as BaseTitle} from '@carbon/react';
import {styles} from '@carbon/elements';
import {Link} from 'modules/components/Link';
import {ErrorMessage as BaseErrorMessage} from 'modules/components/ErrorMessage';

type GridProps = {
  $numberOfColumns: 1 | 2;
};

const Grid = styled.div<GridProps>`
  ${({$numberOfColumns}) => {
    return css`
      width: 100%;
      height: 100%;
      padding: var(--cds-spacing-05);
      display: grid;
      grid-template-rows: 158px 1fr;
      grid-gap: var(--cds-spacing-05);
      ${$numberOfColumns === 2
        ? css`
            grid-template-columns: 1fr 1fr;
            & > ${Tile}:first-of-type {
              grid-column-start: 1;
              grid-column-end: 3;
            }
          `
        : css`
            grid-template-columns: 1fr;
          `}
    `;
  }}
`;

const ScrollableContent = styled.div`
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const Tile = styled(BaseTitle)`
  display: flex;
  flex-direction: column;
  border: 1px solid var(--cds-border-subtle-01);
`;

const TileTitle = styled.h2`
  ${styles.productiveHeading02};
  color: var(--cds-text-primary);
  margin-bottom: var(--cds-spacing-06);
`;

const LinkWrapper = styled(Link)`
  display: block;
  text-decoration: none !important;
  padding: var(--cds-spacing-03) 0;
`;

const ErrorMessage = styled(BaseErrorMessage)`
  margin: auto;
`;

const Li = styled.li`
  // override the hover color on expandable row's children
  &:hover {
    background-color: var(--cds-layer-hover);
  }
`;

export {
  Grid,
  ScrollableContent,
  Tile,
  TileTitle,
  LinkWrapper,
  ErrorMessage,
  Li,
};
