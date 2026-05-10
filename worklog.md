---
Task ID: 1
Agent: main
Task: Fix categorías MTB - usar categorías del DB en formulario de inscripción

Work Log:
- Verificado que la DB de producción ya tiene las 16 categorías correctas para Desafío a La Culata
- Diagnosticado el problema raíz: EventDetailPage NO pasaba `categories` al RegistrationDialog, y usaba `getCategoriesForSport()` (genéricas) en vez de `parseEventCategories(event.categories)`
- Corregido `page.tsx` (eventos/[slug]): ahora usa `parseEventCategories(event.categories, sportType)` para leer categorías desde el DB
- Corregido `EventDetailPage.tsx`: agrega `categories`, `sportType`, `ageCalcMode`, `hasShirt` al event prop pasado al RegistrationDialog; removido `eventConfig` no soportado y `eventTime` no existente en EventCardProps
- Actualizado `generateMTB()` en `categories.ts`: el fallback ahora genera las 16 categorías correctas (con Senior separado de Élite, 100 Kilos masculino, Seguridad como abierta, etc.)
- Build local exitoso, deploy a Vercel producción exitoso

Stage Summary:
- La página de evento ahora muestra las 16 categorías correctas desde el DB
- El formulario de inscripción ahora recibe las categorías del DB y las usa para auto-asignación
- URL producción: https://my-project-o60fm1gyu-venezuelabike-9338s-projects.vercel.app
