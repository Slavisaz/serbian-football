import html from './index.html';

const standings = [
  { position: 1, team: 'Crvena Zvezda', points: 75 },
  { position: 2, team: 'Partizan', points: 68 },
  { position: 3, team: 'TSC Bačka Topola', points: 60 },
  { position: 4, team: 'Čukarički', points: 55 },
  { position: 5, team: 'Vojvodina', points: 50 }
];

export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname === '/api/standings') {
      return new Response(JSON.stringify({ standings }, null, 2), {
        headers: {
          'content-type': 'application/json; charset=UTF-8',
          'cache-control': 'no-store'
        }
      });
    }

    if (url.pathname === '/' || url.pathname === '/index.html') {
      return new Response(html, {
        headers: {
          'content-type': 'text/html; charset=UTF-8'
        }
      });
    }

    return new Response('Not Found', {
      status: 404,
      headers: {
        'content-type': 'text/plain; charset=UTF-8'
      }
    });
  }
};
