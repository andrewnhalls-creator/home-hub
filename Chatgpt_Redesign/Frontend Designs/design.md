# Home Hub: Especificación de Diseño (DESIGN.md)

## 1. Identidad Visual (Casa Calma)
**Concepto:** Un hogar organizado debe sentirse como un refugio. "Casa Calma" utiliza una paleta de colores inspirada en la naturaleza (verdes profundos y tonos tierra suave) combinada con una tipografía moderna y geométrica.

### Colores (Design System 1)
- **Primary:** `#2d5a27` (Verde Bosque) - Usado para acciones principales y estados de éxito.
- **Surface:** `#f4fafd` (Azul Nieve) - Fondo base limpio y relajante.
- **On-Surface:** `#1a1c1e` - Texto principal para alta legibilidad.
- **Accents:** Tonos terracota suaves para advertencias informativas (no alarmistas).

### Tipografía
- **Plus Jakarta Sans:** Fuente principal para toda la interfaz.
  - **Headlines:** `font-headline-sm` (24px) para títulos de sección.
  - **Body:** `font-body-md` (16px) para contenido general.
  - **Labels:** `font-label-sm` (12px) para metadatos y etiquetas pequeñas.

### Espaciado y Formas
- **Radios:** `rounded-2xl` (16px) para tarjetas y contenedores principales. `rounded-full` para botones y avatares.
- **Márgenes:** 16px (Mobile), 40px (Desktop).
- **Sombras:** Elevaciones sutiles (`shadow-sm`) para separar capas sin saturar la vista.

---

## 2. Componentes Reutilizables

### Navegación
- **TopAppBar:** Centrado en el logo "Home Hub" con acceso a notificaciones y perfil de usuario.
- **BottomNavBar (Mobile):** 4-5 destinos principales con etiquetas e iconos consistentes.
- **NavigationRail/Drawer (Desktop):** Columna lateral persistente con categorías y ajustes.

### Listas y Tarjetas
- **ListRows:** Altura mínima de 56px para facilitar el toque. Incluyen siempre un icono/avatar a la izquierda y acción/estado a la derecha.
- **Cards:** Contenedores con borde sutil o fondo contrastado para agrupar información relacionada.

---

## 3. Reglas de Interacción y UX

### Idioma y Formato
- **Idioma:** Siempre Español de España (natural y cercano).
- **Moneda:** Formato `0,00 €`.
- **Fechas:** Lunes como primer día de la semana. Formato `DD/MM/YYYY`.

### Accesibilidad (WCAG AA)
- **Contraste:** Texto oscuro sobre fondo claro siempre > 4.5:1.
- **Touch Targets:** Mínimo 44x44px para cualquier elemento interactivo.
- **Estados:** Los errores se comunican con color, icono y texto descriptivo.

### Privacidad por Diseño
- **Modo Privacidad:** Capacidad de ocultar importes financieros en la vista general.
- **Notificaciones:** Nunca incluyen balances exactos; solo avisos genéricos como "Tenéis un pago próximo".

---

## 4. Guía de Implementación Frontend
- **Framework:** React con Tailwind CSS.
- **Estado:** React Hook Form para formularios, Zod para validaciones.
- **Componentes:** Estructura basada en composición de componentes atómicos.
- **Mock Data:** Mantener lógica de servicios separada para futura integración con APIs (Supabase/PostgreSQL).
