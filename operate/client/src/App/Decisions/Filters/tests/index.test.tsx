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

import {AppHeader} from 'App/Layout/AppHeader';
import {render, screen, waitFor, within} from 'modules/testing-library';
import {groupedDecisions} from 'modules/mocks/groupedDecisions';
import {groupedDecisionsStore} from 'modules/stores/groupedDecisions';
import {LocationLog} from 'modules/utils/LocationLog';
import {MemoryRouter} from 'react-router-dom';
import {Filters} from '../';
import {mockFetchGroupedDecisions} from 'modules/mocks/api/decisions/fetchGroupedDecisions';
import {pickDateTimeRange} from 'modules/testUtils/dateTimeRange';
import {useEffect} from 'react';
import {
  clearComboBox,
  selectDecision,
  selectDecisionVersion,
} from 'modules/testUtils/selectComboBoxOption';
import {Paths} from 'modules/Routes';

jest.unmock('modules/utils/date/formatDate');

function reset() {
  jest.clearAllTimers();
  jest.useRealTimers();
  localStorage.clear();
}

function getWrapper(initialPath: string = Paths.decisions()) {
  const Wrapper: React.FC<{children?: React.ReactNode}> = ({children}) => {
    useEffect(() => {
      return groupedDecisionsStore.reset;
    }, []);

    return (
      <MemoryRouter initialEntries={[initialPath]}>
        <AppHeader />
        {children}
        <LocationLog />
      </MemoryRouter>
    );
  };

  return Wrapper;
}

const expectVersion = (version: string) => {
  expect(
    within(screen.getByLabelText('Version', {selector: 'button'})).getByText(
      version,
    ),
  ).toBeInTheDocument();
};

const MOCK_FILTERS_PARAMS = {
  name: 'invoice-assign-approver',
  version: '2',
  evaluated: 'true',
  failed: 'true',
  decisionInstanceIds: '2251799813689540-1',
  processInstanceId: '2251799813689549',
} as const;

describe('<Filters />', () => {
  beforeEach(async () => {
    mockFetchGroupedDecisions().withSuccess(groupedDecisions);
    await groupedDecisionsStore.fetchDecisions();
    jest.useFakeTimers();
  });

  afterEach(reset);

  it('should render the correct elements', () => {
    render(<Filters />, {
      wrapper: getWrapper(),
    });

    expect(screen.getByText(/^decision$/i)).toBeInTheDocument();
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(
      screen.getByLabelText('Version', {selector: 'button'}),
    ).toBeInTheDocument();
    expect(screen.getByText(/^instances states$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/evaluated/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/failed/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', {name: 'More Filters'}),
    ).toBeInTheDocument();
    expect(
      screen.queryByLabelText('Decision Instance Key(s)'),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText('Process Instance Key'),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText('Evaluation Date Range'),
    ).not.toBeInTheDocument();
  });

  it('should write filters to url', async () => {
    const {user} = render(<Filters />, {
      wrapper: getWrapper(),
    });

    expect(screen.getByTestId('pathname')).toHaveTextContent(/^\/decisions$/);
    expect(screen.getByTestId('search')).toBeEmptyDOMElement();

    await selectDecision({user, option: 'Assign Approver Group'});
    await selectDecisionVersion({user, option: '2'});

    await user.click(screen.getByLabelText(/evaluated/i));
    await user.click(screen.getByLabelText(/failed/i));

    await user.click(screen.getByRole('button', {name: 'More Filters'}));
    await user.click(screen.getByText('Decision Instance Key(s)'));
    await user.type(
      screen.getByText('Decision Instance Key(s)'),
      '2251799813689540-1',
    );

    await user.click(screen.getByRole('button', {name: 'More Filters'}));
    await user.click(screen.getByText('Process Instance Key'));
    await user.type(
      screen.getByText('Process Instance Key'),
      '2251799813689549',
    );

    await user.click(screen.getByRole('button', {name: 'More Filters'}));

    expect(screen.getByTestId('pathname')).toHaveTextContent(/^\/decisions$/);
    await waitFor(() =>
      expect(
        Object.fromEntries(
          new URLSearchParams(
            screen.getByTestId('search').textContent ?? '',
          ).entries(),
        ),
      ).toEqual(MOCK_FILTERS_PARAMS),
    );

    await user.click(screen.getByRole('button', {name: /reset/i}));

    expect(screen.getByTestId('pathname')).toHaveTextContent(/^\/decisions$/);
    expect(screen.getByTestId('search')).toHaveTextContent(
      /^\?evaluated=true&failed=true$/,
    );
  });

  it('should write filters to url - evaluation date range', async () => {
    const {user} = render(<Filters />, {
      wrapper: getWrapper(),
    });

    expect(screen.getByTestId('pathname')).toHaveTextContent(/^\/decisions$/);
    expect(screen.getByTestId('search')).toBeEmptyDOMElement();

    await user.click(screen.getByRole('button', {name: 'More Filters'}));
    await user.click(screen.getByText('Evaluation Date Range'));
    await user.click(screen.getByLabelText('Evaluation Date Range'));
    const evaluationDate = await pickDateTimeRange({
      user,
      screen,
      fromDay: '15',
      toDay: '20',
      fromTime: '20:30:00',
      toTime: '11:03:59',
    });
    await user.click(screen.getByText('Apply'));

    await waitFor(() =>
      expect(
        Object.fromEntries(
          new URLSearchParams(
            screen.getByTestId('search').textContent ?? '',
          ).entries(),
        ),
      ).toEqual({
        evaluationDateAfter: evaluationDate.fromDate,
        evaluationDateBefore: evaluationDate.toDate,
      }),
    );

    await user.click(screen.getByRole('button', {name: /reset/i}));

    expect(screen.getByTestId('pathname')).toHaveTextContent(/^\/decisions$/);
    expect(screen.getByTestId('search')).toHaveTextContent(
      /^\?evaluated=true&failed=true$/,
    );
  });

  it('initialise filter values from url', () => {
    render(<Filters />, {
      wrapper: getWrapper(`/?${new URLSearchParams(MOCK_FILTERS_PARAMS)}`),
    });

    expect(screen.getByLabelText('Name')).toHaveValue('Assign Approver Group');
    expectVersion('2');

    expect(screen.getByLabelText(/evaluated/i)).toBeChecked();
    expect(screen.getByLabelText(/failed/i)).toBeChecked();
    expect(screen.getByDisplayValue(/2251799813689540-1/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue(/2251799813689549/i)).toBeInTheDocument();
  });

  it('initialise filter values from url - evaluation date range', async () => {
    const MOCK_PARAMS = {
      evaluationDateAfter: '2021-02-21 09:00:00',
      evaluationDateBefore: '2021-02-22 10:00:00',
    } as const;

    render(<Filters />, {
      wrapper: getWrapper(`/?${new URLSearchParams(MOCK_PARAMS)}`),
    });

    expect(
      await screen.findByDisplayValue(
        '2021-02-21 09:00:00 - 2021-02-22 10:00:00',
      ),
    ).toBeInTheDocument();
  });

  it('should remove enabled filters on unmount', async () => {
    const {unmount, user} = render(<Filters />, {
      wrapper: getWrapper(),
    });

    expect(
      screen.queryByLabelText('Decision Instance Key(s)'),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText('Process Instance Key'),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText('Evaluation Date Range'),
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', {name: 'More Filters'}));
    await user.click(screen.getByText('Decision Instance Key(s)'));

    await user.click(screen.getByRole('button', {name: 'More Filters'}));
    await user.click(screen.getByText('Process Instance Key'));

    await user.click(screen.getByRole('button', {name: 'More Filters'}));
    await user.click(screen.getByText('Evaluation Date Range'));

    expect(
      screen.getByLabelText('Decision Instance Key(s)'),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Process Instance Key')).toBeInTheDocument();

    unmount();

    render(<Filters />, {
      wrapper: getWrapper(),
    });

    expect(
      screen.queryByLabelText('Decision Instance Key(s)'),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText('Process Instance Key'),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText('Evaluation Date Range'),
    ).not.toBeInTheDocument();
  });

  it('should hide optional filters', async () => {
    const {user} = render(<Filters />, {
      wrapper: getWrapper(),
    });

    await user.click(screen.getByRole('button', {name: 'More Filters'}));
    await user.click(screen.getByText('Decision Instance Key(s)'));

    await user.click(screen.getByRole('button', {name: 'More Filters'}));
    await user.click(screen.getByText('Process Instance Key'));

    await user.click(screen.getByRole('button', {name: 'More Filters'}));
    await user.click(screen.getByText('Evaluation Date Range'));

    expect(
      screen.getByLabelText('Decision Instance Key(s)'),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Process Instance Key')).toBeInTheDocument();
    expect(screen.getByLabelText('Evaluation Date Range')).toBeInTheDocument();

    await user.hover(screen.getByLabelText('Decision Instance Key(s)'));
    await user.click(
      screen.getByLabelText('Remove Decision Instance Key(s) Filter'),
    );

    await user.hover(screen.getByLabelText('Process Instance Key'));
    await user.click(
      screen.getByLabelText('Remove Process Instance Key Filter'),
    );

    await user.hover(screen.getByLabelText('Evaluation Date Range'));
    await user.click(
      screen.getByLabelText('Remove Evaluation Date Range Filter'),
    );

    expect(
      screen.queryByLabelText('Decision Instance Key(s)'),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText('Process Instance Key'),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText('Evaluation Date Range'),
    ).not.toBeInTheDocument();
  });

  it('should select decision name and version', async () => {
    const {user} = render(<Filters />, {
      wrapper: getWrapper(),
    });

    expect(
      screen.getByLabelText('Version', {selector: 'button'}),
    ).toBeDisabled();

    await selectDecision({user, option: 'Assign Approver Group'});
    await waitFor(() => expectVersion('2'));

    expect(
      screen.getByLabelText('Version', {selector: 'button'}),
    ).toBeEnabled();

    await selectDecisionVersion({user, option: '1'});
    await waitFor(() => expectVersion('1'));
    expect(
      screen.getByLabelText('Version', {selector: 'button'}),
    ).toBeEnabled();

    await clearComboBox({user, fieldName: 'Name'});
    expect(
      screen.getByLabelText('Version', {selector: 'button'}),
    ).toBeDisabled();
  });

  it('should validate decision instance keys', async () => {
    const {user} = render(<Filters />, {
      wrapper: getWrapper(),
    });

    expect(screen.getByTestId('search')).toBeEmptyDOMElement();

    await user.click(screen.getByRole('button', {name: 'More Filters'}));
    await user.click(screen.getByText('Decision Instance Key(s)'));
    await user.type(screen.getByLabelText('Decision Instance Key(s)'), 'a');

    expect(
      await screen.findByText(
        'Key has to be a 16 to 20 digit number with an index, e.g. 2251799813702856-1',
      ),
    ).toBeInTheDocument();
    expect(screen.getByTestId('search')).toBeEmptyDOMElement();

    await user.clear(screen.getByLabelText('Decision Instance Key(s)'));

    expect(
      screen.queryByText(
        'Key has to be a 16 to 20 digit number with an index, e.g. 2251799813702856-1',
      ),
    ).not.toBeInTheDocument();

    await user.type(screen.getByLabelText('Decision Instance Key(s)'), '1');

    expect(
      await screen.findByText(
        'Key has to be a 16 to 20 digit number with an index, e.g. 2251799813702856-1',
      ),
    ).toBeInTheDocument();

    await user.clear(screen.getByLabelText('Decision Instance Key(s)'));

    expect(
      screen.queryByText(
        'Key has to be a 16 to 20 digit number with an index, e.g. 2251799813702856-1',
      ),
    ).not.toBeInTheDocument();

    await user.type(
      screen.getByLabelText('Decision Instance Key(s)'),
      '2251799813689549',
    );

    expect(
      await screen.findByText(
        'Key has to be a 16 to 20 digit number with an index, e.g. 2251799813702856-1',
      ),
    ).toBeInTheDocument();

    await user.clear(screen.getByLabelText('Decision Instance Key(s)'));

    expect(
      screen.queryByText(
        'Key has to be a 16 to 20 digit number with an index, e.g. 2251799813702856-1',
      ),
    ).not.toBeInTheDocument();
  });

  it('should validate process instance key', async () => {
    const {user} = render(<Filters />, {
      wrapper: getWrapper(),
    });
    expect(screen.getByTestId('search')).toBeEmptyDOMElement();

    await user.click(screen.getByRole('button', {name: 'More Filters'}));
    await user.click(screen.getByText('Process Instance Key'));
    await user.type(screen.getByLabelText('Process Instance Key'), 'a');

    expect(
      await screen.findByText('Key has to be a 16 to 19 digit number'),
    ).toBeInTheDocument();
    expect(screen.getByTestId('search')).toBeEmptyDOMElement();

    await user.clear(screen.getByLabelText('Process Instance Key'));

    expect(
      screen.queryByText('Key has to be a 16 to 19 digit number'),
    ).not.toBeInTheDocument();

    await user.type(screen.getByLabelText('Process Instance Key'), '1');

    expect(
      await screen.findByText('Key has to be a 16 to 19 digit number'),
    ).toBeInTheDocument();

    await user.clear(screen.getByLabelText('Process Instance Key'));

    expect(
      screen.queryByText('Key has to be a 16 to 19 digit number'),
    ).not.toBeInTheDocument();

    await user.type(
      screen.getByLabelText('Process Instance Key'),
      '1111111111111111, 2222222222222222',
    );

    expect(
      await screen.findByText('Key has to be a 16 to 19 digit number'),
    ).toBeInTheDocument();

    await user.clear(screen.getByLabelText('Process Instance Key'));

    expect(
      screen.queryByText('Key has to be a 16 to 19 digit number'),
    ).not.toBeInTheDocument();
  });

  it('should reset applied filters on navigation', async () => {
    const {user} = render(<Filters />, {
      wrapper: getWrapper(),
    });

    expect(screen.getByTestId('pathname')).toHaveTextContent(/^\/decisions$/);
    expect(screen.getByTestId('search')).toBeEmptyDOMElement();

    await user.click(screen.getByRole('button', {name: 'More Filters'}));
    await user.click(screen.getByText('Process Instance Key'));
    await user.type(
      screen.getByLabelText('Process Instance Key'),
      '2251799813729387',
    );

    await waitFor(() =>
      expect(screen.getByTestId('search')).toHaveTextContent(
        /^\?processInstanceId=2251799813729387$/,
      ),
    );

    await user.click(
      within(
        screen.getByRole('navigation', {
          name: /camunda operate/i,
        }),
      ).getByRole('link', {
        name: /dashboard/i,
      }),
    );
    expect(screen.getByTestId('pathname')).toHaveTextContent(/^\/$/);
    expect(screen.getByTestId('search')).toBeEmptyDOMElement();

    await user.click(
      within(
        screen.getByRole('navigation', {
          name: /camunda operate/i,
        }),
      ).getByRole('link', {
        name: /decisions/i,
      }),
    );
    expect(screen.getByTestId('pathname')).toHaveTextContent(/^\/decisions$/);
    expect(screen.getByTestId('search')).toHaveTextContent(
      /^\?evaluated=true&failed=true$/,
    );
  });

  it('should omit all versions option', async () => {
    reset();
    const firstDecision = groupedDecisions[0]!;
    const firstVersion = firstDecision.decisions[1]!;

    mockFetchGroupedDecisions().withSuccess([
      {...firstDecision, decisions: [firstVersion]},
    ]);

    await groupedDecisionsStore.fetchDecisions();

    jest.useFakeTimers();

    const {user} = render(<Filters />, {
      wrapper: getWrapper(
        `/decisions?name=${firstDecision.decisionId}&version=${firstVersion}`,
      ),
    });

    await user.click(
      screen.getByLabelText(/version/i, {
        selector: 'button',
      }),
    );

    const versionDropdownList = screen.queryByLabelText(/version/i, {
      selector: 'ul',
    })!;

    expect(
      within(versionDropdownList).queryByRole('option', {
        name: /all/i,
      }),
    ).not.toBeInTheDocument();
  });
});
