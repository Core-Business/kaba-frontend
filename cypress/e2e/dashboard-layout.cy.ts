describe('Dashboard Layout Reorganization', () => {
  beforeEach(() => {
    // Mock de autenticación
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
          }
        ]
      }
    }).as('getContexts');

    // Mock de procedimientos
    cy.intercept('GET', '**/procedures**', {
      statusCode: 200,
      body: []
    }).as('getProcedures');

    // Simular autenticación
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

  it('should display header with Dashboard title, WorkspaceSelector, and UserNav', () => {
    // Verificar que existe el header
    cy.get('header').should('be.visible');

    // Verificar título Dashboard
    cy.get('h1').should('contain.text', 'Dashboard').and('be.visible');

    // Verificar que WorkspaceSelector está junto al título
    cy.get('header').within(() => {
      cy.get('[data-testid="workspace-selector"]').should('be.visible');
    });

    // Verificar que UserNav (avatar) está en la esquina superior derecha
    cy.get('header').within(() => {
      cy.get('[role="button"]').contains('T').should('be.visible'); // Avatar con iniciales
    });
  });

  it('should display metrics cards with improved styling', () => {
    // Verificar que las métricas están visibles
    cy.get('[data-testid="metrics-grid"]').should('be.visible');

    // Verificar estilos aplicados según brief (rounded-md, shadow-sm, etc.)
    cy.get('[data-testid="metric-card"]').should('have.length', 4);
    cy.get('[data-testid="metric-card"]').first()
      .should('have.class', 'rounded-md')
      .and('have.class', 'shadow-sm')
      .and('have.class', 'bg-white');

    // Verificar títulos de métricas
    cy.contains('Total de Procedimientos').should('be.visible');
    cy.contains('Publicados').should('be.visible');
    cy.contains('Borradores').should('be.visible');
    cy.contains('Recientes (7 días)').should('be.visible');
  });

  it('should display New Procedure button to the right of metrics', () => {
    // Verificar que el botón está visible y posicionado correctamente
    cy.get('[data-testid="new-procedure-button"]')
      .should('be.visible')
      .and('contain.text', 'Nuevo Procedimiento');

    // Verificar que está en la misma fila que las métricas
    cy.get('[data-testid="metrics-container"]').within(() => {
      cy.get('[data-testid="new-procedure-button"]').should('exist');
    });

    // Verificar que funciona el click
    cy.get('[data-testid="new-procedure-button"]').click();
    cy.url().should('include', '/builder/new');
  });

  it('should display search input below metrics and above tabs', () => {
    // Verificar que el buscador está visible
    cy.get('[data-testid="search-procedures"]').should('be.visible');

    // Verificar que está alineado a la derecha
    cy.get('[data-testid="search-container"]')
      .should('have.class', 'justify-end');

    // Verificar placeholder
    cy.get('[data-testid="search-procedures"]')
      .find('input')
      .should('have.attr', 'placeholder', 'Buscar procedimientos...');

    // Verificar funcionalidad de búsqueda
    cy.get('[data-testid="search-procedures"]')
      .find('input')
      .type('test search');

    cy.get('[data-testid="search-procedures"]')
      .find('button')
      .click();

    // Aquí se verificaría que se actualiza la lista de procedimientos
    // Depende de la implementación específica
  });

  it('should display tabs below search input', () => {
    // Verificar que los tabs están visibles
    cy.get('[role="tablist"]').should('be.visible');

    // Verificar los tabs según el brief
    cy.get('[role="tab"]').should('have.length', 3);
    cy.get('[role="tab"]').eq(0).should('contain.text', 'Recientes');
    cy.get('[role="tab"]').eq(1).should('contain.text', 'Publicados');
    cy.get('[role="tab"]').eq(2).should('contain.text', 'Borradores');
  });

  it('should maintain responsive design on mobile', () => {
    // Cambiar a viewport móvil
    cy.viewport('iphone-6');

    // Verificar que el header se adapta
    cy.get('header').should('be.visible');
    cy.get('[data-testid="workspace-selector"]').should('be.visible');

    // Verificar que las métricas se adaptan (grid responsivo)
    cy.get('[data-testid="metric-card"]').should('be.visible');

    // Verificar que el sidebar móvil funciona
    cy.get('[data-testid="mobile-menu-button"]').should('be.visible').click();
    cy.get('[data-testid="mobile-sidebar"]').should('be.visible');
  });

  it('should use correct color scheme according to brief', () => {
    // Verificar colores corporativos en elementos clave
    cy.get('h1').should('have.css', 'color', 'rgb(16, 54, 125)'); // #10367D

    // Verificar background gris claro
    cy.get('body').should('have.class', 'bg-slate-50');

    // Verificar estilos del WorkspaceSelector (gris slate)
    cy.get('[data-testid="workspace-selector"]')
      .should('have.class', 'bg-slate-100');
  });

  it('should maintain consistent spacing according to brief', () => {
    // Verificar espaciado gap-4 entre elementos principales
    cy.get('[data-testid="metrics-container"]')
      .should('have.class', 'gap-4');

    // Verificar márgenes consistentes
    cy.get('[data-testid="search-container"]')
      .should('have.class', 'mb-6');

    // Verificar padding en cards
    cy.get('[data-testid="metric-card"]').first()
      .find('[data-testid="card-content"]')
      .should('have.class', 'p-4');
  });

  it('should show empty state with centered New Procedure button', () => {
    // Mock de procedimientos vacíos
    cy.intercept('GET', '**/procedures**', {
      statusCode: 200,
      body: []
    }).as('getEmptyProcedures');

    cy.reload();
    cy.wait('@getEmptyProcedures');

    // Verificar estado vacío
    cy.contains('No hay procedimientos').should('be.visible');
    cy.contains('Crea tu primer procedimiento para comenzar.').should('be.visible');

    // Verificar botón centrado en estado vacío
    cy.get('[data-testid="empty-state"]').within(() => {
      cy.get('[data-testid="new-procedure-button"]').should('be.visible');
    });
  });

  it('should handle loading states correctly', () => {
    // Mock loading state
    cy.intercept('GET', '**/procedures**', { delay: 2000, body: [] }).as('getProceduresSlow');

    cy.visit('/dashboard');

    // Verificar estados de carga en métricas
    cy.get('[data-testid="metric-card"]').first().within(() => {
      cy.get('[data-testid="loading-spinner"]').should('be.visible');
    });

    // Verificar estado de carga en lista
    cy.contains('Cargando procedimientos...').should('be.visible');

    cy.wait('@getProceduresSlow');

    // Verificar que desaparece el loading
    cy.get('[data-testid="loading-spinner"]').should('not.exist');
  });
}); 