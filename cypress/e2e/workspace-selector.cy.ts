describe('Workspace Selector', () => {
  beforeEach(() => {
    // Mock de autenticación y workspaces
    cy.intercept('GET', '**/auth/contexts', {
      statusCode: 200,
      body: {
        userId: 'test-user',
        currentOrganization: 'test-org',
        currentWorkspace: 'workspace-1',
        currentRole: 'WORKSPACE_ADMIN',
        organizations: [],
        availableContexts: [
          {
            id: 'workspace-1',
            name: 'Core Business',
            organizationId: 'test-org',
            role: 'WORKSPACE_ADMIN'
          },
          {
            id: 'workspace-2', 
            name: 'Marketing',
            organizationId: 'test-org',
            role: 'EDITOR'
          },
          {
            id: 'workspace-3',
            name: 'Development',
            organizationId: 'test-org', 
            role: 'VIEWER'
          }
        ]
      }
    }).as('getContexts');

    cy.intercept('POST', '**/auth/switch-workspace', {
      statusCode: 200,
      body: {
        accessToken: 'new-jwt-token',
        refreshToken: 'new-refresh-token',
        tokenType: 'Bearer',
        expiresIn: 3600
      }
    }).as('switchWorkspace');

    // Mock de procedimientos
    cy.intercept('GET', '**/procedures**', {
      statusCode: 200,
      body: []
    }).as('getProcedures');

    // Simular token y user en localStorage
    cy.window().then((window) => {
      window.localStorage.setItem('kaba.token', 'mock-jwt-token');
      window.localStorage.setItem('kaba.user', JSON.stringify({
        id: 'test-user',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User'
      }));
      window.localStorage.setItem('kaba.lastWorkspace', JSON.stringify({
        orgId: 'test-org',
        wsId: 'workspace-1',
        wsName: 'Core Business',
        role: 'WORKSPACE_ADMIN'
      }));
    });

    cy.visit('/dashboard');
    cy.wait('@getContexts');
  });

  it('should display workspace selector with current workspace name', () => {
    // Verificar que el selector está visible
    cy.get('[data-testid="workspace-selector"]')
      .should('be.visible')
      .and('contain.text', 'Core Business');

    // Verificar que tiene el icono de Building
    cy.get('[data-testid="workspace-selector"]')
      .find('svg')
      .should('exist');
  });

  it('should open dropdown when clicked', () => {
    // Esperar a que se complete la hidratación y se carguen los datos
    cy.get('[data-testid="workspace-selector"]').should('not.contain.text', 'Cargando...');
    
    // Click en el selector
    cy.get('[data-testid="workspace-selector"]').click();

    // Verificar que el dropdown está abierto
    cy.get('[role="menu"]').should('be.visible');

    // Verificar que muestra todos los workspaces disponibles
    cy.get('[role="menuitem"]').should('have.length', 3);
    cy.get('[role="menuitem"]').first().should('contain.text', 'Core Business');
    cy.get('[role="menuitem"]').eq(1).should('contain.text', 'Marketing');
    cy.get('[role="menuitem"]').eq(2).should('contain.text', 'Development');
  });

  it('should show role labels correctly', () => {
    // Esperar a que se complete la hidratación
    cy.get('[data-testid="workspace-selector"]').should('not.contain.text', 'Cargando...');
    cy.get('[data-testid="workspace-selector"]').click();

    // Verificar los roles en español
    cy.get('[role="menuitem"]').first().should('contain.text', 'Administrador');
    cy.get('[role="menuitem"]').eq(1).should('contain.text', 'Editor');
    cy.get('[role="menuitem"]').eq(2).should('contain.text', 'Visualizador');
  });

  it('should show check mark for current workspace', () => {
    // Esperar a que se complete la hidratación
    cy.get('[data-testid="workspace-selector"]').should('not.contain.text', 'Cargando...');
    cy.get('[data-testid="workspace-selector"]').click();

    // Verificar que el workspace actual tiene check mark
    cy.get('[role="menuitem"]').first()
      .find('[data-testid="check-icon"]')
      .should('exist');

    // Verificar que otros workspaces no tienen check mark
    cy.get('[role="menuitem"]').eq(1)
      .find('[data-testid="check-icon"]')
      .should('not.exist');
  });

  it('should switch workspace successfully', () => {
    // Stub de window.location.reload para evitar recarga real
    cy.window().then((win) => {
      cy.stub(win.location, 'reload').as('windowReload');
    });

    // Esperar a que se complete la hidratación
    cy.get('[data-testid="workspace-selector"]').should('not.contain.text', 'Cargando...');
    cy.get('[data-testid="workspace-selector"]').click();

    // Seleccionar otro workspace
    cy.get('[role="menuitem"]').eq(1).click();

    // Verificar que se llamó al API de switch-workspace
    cy.wait('@switchWorkspace').then((interception) => {
      expect(interception.request.body).to.deep.equal({
        workspaceId: 'workspace-2'
      });
    });

    // Verificar que aparece toast de éxito
    cy.get('[data-testid="toast"]')
      .should('be.visible')
      .and('contain.text', 'Workspace cambiado')
      .and('contain.text', 'Marketing');

    // Verificar que se actualiza localStorage
    cy.window().then((window) => {
      const workspace = JSON.parse(window.localStorage.getItem('kaba.lastWorkspace') || '{}');
      expect(workspace.wsId).to.equal('workspace-2');
      expect(workspace.wsName).to.equal('Marketing');
    });

    // Verificar que se recarga la página después de 500ms
    cy.get('@windowReload', { timeout: 1000 }).should('have.been.called');
  });

  it('should handle API error gracefully', () => {
    // Mock error en switch-workspace
    cy.intercept('POST', '**/auth/switch-workspace', {
      statusCode: 500,
      body: { message: 'Server error' }
    }).as('switchWorkspaceError');

    // Esperar a que se complete la hidratación
    cy.get('[data-testid="workspace-selector"]').should('not.contain.text', 'Cargando...');
    cy.get('[data-testid="workspace-selector"]').click();
    cy.get('[role="menuitem"]').eq(1).click();

    cy.wait('@switchWorkspaceError');

    // Verificar que aparece toast de error
    cy.get('[data-testid="toast"]')
      .should('be.visible')
      .and('contain.text', 'Error')
      .and('contain.text', 'No se pudo cambiar el workspace');
  });

  it('should disable selector when switching', () => {
    // Esperar a que se complete la hidratación
    cy.get('[data-testid="workspace-selector"]').should('not.contain.text', 'Cargando...');
    cy.get('[data-testid="workspace-selector"]').click();
    cy.get('[role="menuitem"]').eq(1).click();

    // Durante el switch, el contenedor debe estar deshabilitado visualmente
    cy.get('[data-testid="workspace-selector"]')
      .should('have.class', 'opacity-50')
      .and('have.class', 'cursor-not-allowed');
  });

  it('should close dropdown when selecting same workspace', () => {
    // Esperar a que se complete la hidratación
    cy.get('[data-testid="workspace-selector"]').should('not.contain.text', 'Cargando...');
    cy.get('[data-testid="workspace-selector"]').click();

    // Seleccionar el mismo workspace
    cy.get('[role="menuitem"]').first().click();

    // Verificar que no se llama al API
    cy.get('@switchWorkspace.all').should('have.length', 0);

    // Verificar que el dropdown se cierra
    cy.get('[role="menu"]').should('not.exist');
  });

  it('should display loading state correctly', () => {
    // Mock loading state
    cy.intercept('GET', '**/auth/contexts', { delay: 2000, body: [] }).as('getContextsSlow');
    
    cy.visit('/dashboard');

    // Verificar estado de carga
    cy.get('[data-testid="workspace-selector"]')
      .should('contain.text', 'Cargando...');
  });
}); 