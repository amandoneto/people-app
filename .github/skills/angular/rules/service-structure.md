# Angular Service Structure Rule

Organize services by application scope and domain responsibility. Keep services close to the layer that owns their behavior, and create folders only when they contain relevant application code.

## Application Structure

```text
src/app/
├── core/                         # Application-wide singleton and infrastructure code
│   ├── auth/                     # Authentication service and route guards
│   └── services/                 # Global infrastructure services
├── shared/                       # Reusable code used by multiple features
│   └── services/                 # Cross-feature utilities, such as notifications or storage
└── features/                     # Domain-specific application functionality
    └── <feature>/
        ├── data-access/          # Feature API, state, and data-access services
        ├── models/               # Feature-owned domain models and types
        └── ui/                   # Feature-specific visual components
```

## Placement Rules

- Put application-wide singleton services and infrastructure services in `core/`.
- Keep authentication services and route guards together under `core/auth/`.
- Put reusable services in `shared/services/` only when they are genuinely used by multiple features and do not belong to one domain.
- Put API, state, and data-access services in the owning feature's `data-access/` directory.
- Keep feature-specific models under that feature's `models/` directory. Do not move domain types into `shared/` solely to make them appear reusable.
- Keep feature-specific UI under that feature's `ui/` directory.
- Do not put feature-specific business logic in `core/` or `shared/`.
- Use descriptive kebab-case filenames, such as `theme.service.ts`, `product-store.service.ts`, and `auth.guard.ts`.
- Provide application-wide singleton services with `providedIn: 'root'`. Choose a narrower provider scope when the service state must be isolated to a component or feature instance.
- Import services through their owning folder and update all references when moving a service.

For example, a global theme service belongs in `core/services/theme.service.ts`, while a product API service belongs in `features/products/data-access/product.service.ts`.
