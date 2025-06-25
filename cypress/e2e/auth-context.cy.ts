describe('Auth Context and Headers', () => {
  beforeEach(() => {
    // Limpiar localStorage
    cy.window().then((win) => {
      win.localStorage.clear();
    });
  });

  it('should send required headers with authenticated requests', () => {
    // Mock del login response
    cy.intercept('POST', '**/auth/login', {
      statusCode: 200,
      body: {
        data: {
          accessToken: 'mock-jwt-token'
        }
      }
    }).as('loginRequest');

    // Mock del contexts response
    cy.intercept('GET', '**/auth/contexts', {
      statusCode: 200,
      body: {
        userId: 'user-123',
        currentOrganization: 'org-123',
        currentWorkspace: 'ws-123',
        currentRole: 'WORKSPACE_ADMIN',
        availableContexts: []
      }
    }).as('contextsRequest');

    // Mock de cualquier API call posterior
    cy.intercept('GET', '**/procedures', {
      statusCode: 200,
      body: []
    }).as('proceduresRequest');

    // Establecer workspace en localStorage antes de la request
    cy.window().then((win) => {
      win.localStorage.setItem('kaba.token', 'mock-jwt-token');
      win.localStorage.setItem('kaba.lastWorkspace', JSON.stringify({
        orgId: 'org-123',
        wsId: 'ws-123',
        wsName: 'Test Workspace',
        role: 'WORKSPACE_ADMIN'
      }));
    });

    // Visitar una página que haga requests
    cy.visit('/dashboard');

    // Verificar que se hizo el request con headers correctos
    cy.wait('@proceduresRequest').then((interception) => {
      expect(interception.request.headers).to.have.property('authorization', 'Bearer mock-jwt-token');
      expect(interception.request.headers).to.have.property('x-organization-id', 'org-123');
      expect(interception.request.headers).to.have.property('x-workspace-id', 'ws-123');
    });
  });

  it('should handle 403 error and redirect to workspace-revoked', () => {
    // Mock del login response
    cy.intercept('POST', '**/auth/login', {
      statusCode: 200,
      body: {
        data: {
          accessToken: 'mock-jwt-token'
        }
      }
    }).as('loginRequest');

    // Mock de API call que devuelve 403
    cy.intercept('GET', '**/procedures', {
      statusCode: 403,
      body: {
        message: 'Forbidden'
      }
    }).as('forbiddenRequest');

    // Establecer token en localStorage
    cy.window().then((win) => {
      win.localStorage.setItem('kaba.token', 'mock-jwt-token');
      win.localStorage.setItem('kaba.lastWorkspace', JSON.stringify({
        orgId: 'org-123',
        wsId: 'ws-123',
        wsName: 'Test Workspace',
        role: 'WORKSPACE_ADMIN'
      }));
    });

    // Visitar dashboard (que haría el request)
    cy.visit('/dashboard');

    // Esperar el request 403
    cy.wait('@forbiddenRequest');

    // Verificar redirección a workspace-revoked
    cy.url().should('include', '/workspace-revoked');
    cy.contains('Acceso Denegado').should('be.visible');
  });

  it('should handle 429 error and show toast message', () => {
    // Mock del login response
    cy.intercept('POST', '**/auth/login', {
      statusCode: 200,
      body: {
        data: {
          accessToken: 'mock-jwt-token'
        }
      }
    }).as('loginRequest');

    // Mock de switch workspace que devuelve 429
    cy.intercept('POST', '**/auth/switch-workspace', {
      statusCode: 429,
      body: {
        message: 'Too Many Requests'
      }
    }).as('rateLimitRequest');

    // Establecer contexto en localStorage
    cy.window().then((win) => {
      win.localStorage.setItem('kaba.token', 'mock-jwt-token');
      win.localStorage.setItem('kaba.lastWorkspace', JSON.stringify({
        orgId: 'org-123',
        wsId: 'ws-123',
        wsName: 'Test Workspace',
        role: 'WORKSPACE_ADMIN'
      }));
    });

    // Visitar dashboard
    cy.visit('/dashboard');

    // Simular llamada a switch workspace
    cy.window().then((win) => {
      // Simulamos la llamada a la API que causaría 429
      cy.request({
        method: 'POST',
        url: '**/auth/switch-workspace',
        body: { workspaceId: 'new-ws-123' },
        failOnStatusCode: false
      });
    });

    // Verificar que aparece el toast de rate limit
    // Nota: Esto dependería de cómo esté implementado el sistema de toasts
    cy.contains('Demasiados cambios').should('be.visible');
  });

  it('should clear auth data on 401 error', () => {
    // Establecer datos de auth en localStorage
    cy.window().then((win) => {
      win.localStorage.setItem('kaba.token', 'expired-token');
      win.localStorage.setItem('kaba.user', JSON.stringify({ id: 'user-123' }));
      win.localStorage.setItem('kaba.lastWorkspace', JSON.stringify({
        orgId: 'org-123',
        wsId: 'ws-123'
      }));
    });

    // Mock de API call que devuelve 401
    cy.intercept('GET', '**/procedures', {
      statusCode: 401,
      body: {
        message: 'Unauthorized'
      }
    }).as('unauthorizedRequest');

    // Visitar dashboard
    cy.visit('/dashboard');

    // Esperar el request 401
    cy.wait('@unauthorizedRequest');

    // Verificar que se limpió localStorage y se redirigió
    cy.window().then((win) => {
      expect(win.localStorage.getItem('kaba.token')).to.be.null;
      expect(win.localStorage.getItem('kaba.user')).to.be.null;
      expect(win.localStorage.getItem('kaba.lastWorkspace')).to.be.null;
    });

    // Verificar redirección al login
    cy.url().should('include', '/login');
  });
}); 