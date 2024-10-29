function makeURL(pathname) {
  return (
    'http://localhost:5173/loginexternal/Bearer+eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICItZ0hUeXJvR0htanBUSXZFb1V3T1luTzVDS2JFbERNc0ZCLWNXWEVDWkpRIn0.eyJleHAiOjE3MjYyOTUxNDQsImlhdCI6MTcyNjI1MTk0NCwiYXV0aF90aW1lIjoxNzI2MjUxOTQzLCJqdGkiOiI2NjEzNWExYi04YWJlLTRhMTItOTI1ZS0wYTgzNThiYmU2MGMiLCJpc3MiOiJodHRwczovL2FjY291bnRzLndlbmkuYWkvYXV0aC9yZWFsbXMvd2VuaSIsImF1ZCI6ImFjY291bnQiLCJzdWIiOiIxMDA4NGQxNi0zOTUwLTQyOTAtOTMwZS02ZmI2MzU5MmRlZWIiLCJ0eXAiOiJCZWFyZXIiLCJhenAiOiJ3ZW5pLXdlYmFwcCIsInNlc3Npb25fc3RhdGUiOiJiY2MyZmRlOS05NWM0LTRjMmQtYTA3ZC00YjNhYWM4YmI5NjUiLCJhbGxvd2VkLW9yaWdpbnMiOlsiKiIsImh0dHA6Ly93ZW5pLXdlYmFwcC1kZXZlbG9wbWVudC53ZW5pLmFpOjkwMDAvKiJdLCJyZWFsbV9hY2Nlc3MiOnsicm9sZXMiOlsib2ZmbGluZV9hY2Nlc3MiLCJ1bWFfYXV0aG9yaXphdGlvbiJdfSwicmVzb3VyY2VfYWNjZXNzIjp7ImFjY291bnQiOnsicm9sZXMiOlsibWFuYWdlLWFjY291bnQiLCJtYW5hZ2UtYWNjb3VudC1saW5rcyIsInZpZXctcHJvZmlsZSJdfX0sInNjb3BlIjoiZW1haWwgb3BlbmlkIG9mZmxpbmVfYWNjZXNzIHByb2ZpbGUiLCJzaWQiOiJiY2MyZmRlOS05NWM0LTRjMmQtYTA3ZC00YjNhYWM4YmI5NjUiLCJpZGVudGl0eV9wcm92aWRlciI6Imdvb2dsZSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJuYW1lIjoiTWF0aGV1cyBDcmlzdGlhbiIsInByZWZlcnJlZF91c2VybmFtZSI6Im1hdGhldXMuY3Jpc3RpYW5Ad2VuaS5haSIsImxvY2FsZSI6ImVuIiwiZ2l2ZW5fbmFtZSI6Ik1hdGhldXMiLCJmYW1pbHlfbmFtZSI6IkNyaXN0aWFuIiwiZW1haWwiOiJtYXRoZXVzLmNyaXN0aWFuQHdlbmkuYWkifQ.Ot7x95CFKXx8OrA6fzD6P-D-9uBHoHQUGn8lw4Da8zz1W9TbFAMfyzjzSkRNVt6u1kifWjKibfKvIxEv6p-3EDkAtR-Cdxgudmny23s2ToixXSK3lS1SyfMHAioHcS7dbzeuECmyItwq_yAnZ0e9w5-QduzadiMGLqzAypbTi1VnLtRuoxsWwrjgxp7X00OuXhji83i5pqn2O59Aw9c9Qq_2EWW2iio04tS6J-2rYPQksDd9HePBhABDk55A_8E9fRD-3MWDg1Zly2-nNSHe5YwQkYVux7u36GQIgnE25SoAwjOLZAIVUEsC_o0qsDptW6mHSJXjqaMhkLGcUhlVeA/428638/3c488c2e-25f0-4ae9-8b7b-3f31455f2356/?org_uuid=70174dd0-9ae0-4115-8ec0-951eed15047b&project_uuid=3c488c2e-25f0-4ae9-8b7b-3f31455f2356&next=' +
    encodeURIComponent(pathname)
  );
}

describe('template spec', () => {
  it('passes', () => {
    cy.visit(makeURL('router/personalization'));

    cy.intercept(
      'GET',
      'https://nexus.weni.ai/api/3c488c2e-25f0-4ae9-8b7b-3f31455f2356/router/',
      {
        fixture: 'getRouter.json',
      },
    );

    cy.intercept('GET', 'https://api.bothub.it/v2/account/my-profile/', {
      fixture: 'getMyProfile.json',
    });

    cy.intercept(
      'GET',
      'https://accounts.weni.ai/auth/realms/weni/protocol/openid-connect/userinfo',
      {
        fixture: 'getKeycloakUserinfo.json',
      },
    );

    cy.intercept(
      'GET',
      'https://nexus.weni.ai/api/4cff4cc4-db37-4fac-a441-1fc118d9f47b/content-bases/c96a89a8-5919-403f-ae06-5ddc5d15f0cf/',
      {
        fixture: 'getRouterContentBase.json',
      },
    );
  });
});
