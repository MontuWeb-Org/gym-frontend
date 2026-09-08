import { http, HttpResponse } from 'msw';

export const dashboardHandlers = [
  http.get('*/api/users/trainer/dashboard', () => {
    return HttpResponse.json({
      data: {
        widgets: [
          {
            id: 'metric-total-trainees',
            type: 'score_card',
            colSpan: 'col-span-1',
            data: { title: 'Total Trainees', value: '32', iconName: 'users' },
          },
          {
            id: 'metric-adherence',
            type: 'score_card',
            colSpan: 'col-span-1',
            data: { title: 'Avg Adherence', value: '87%', iconName: 'activity' },
          },
          {
            id: 'metric-active-programs',
            type: 'score_card',
            colSpan: 'col-span-1',
            data: { title: 'Active Programs', value: '5', iconName: 'check' },
          },
          {
            id: 'metric-pending-invites',
            type: 'score_card',
            colSpan: 'col-span-1',
            data: { title: 'Pending Invites', value: '3', iconName: 'users' },
          },
          {
            id: 'table-falling-behind',
            type: 'table',
            colSpan: 'col-span-1 md:col-span-2 lg:col-span-4',
            data: {
              title: 'Falling behind — needs attention',
              columns: ['Trainee', 'Adherence', 'Last Session'],
              rows: [
                { id: '1', name: 'Trainee A', adherence: '38%', lastSession: '9 days ago' },
                { id: '2', name: 'Trainee B', adherence: '55%', lastSession: '5 days ago' },
              ],
            },
          },
          {
            id: 'chart-weekly-activity',
            type: 'chart',
            colSpan: 'col-span-1 md:col-span-2 lg:col-span-4',
            data: {
              title: "This week's activity",
              chartType: 'bar',
              labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
              datasets: [
                { label: 'Workouts Logged', data: [4, 8, 6, 12, 9, 3, 2] },
              ],
            },
          },
        ],
      },
    });
  }),
];