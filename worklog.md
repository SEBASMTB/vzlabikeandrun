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
---
Task ID: 2
Agent: main
Task: Categorías en BLANCO para MTB+Ruta y fix URL de producción

Work Log:
- Modificado categories.ts: getCategoriesForSport("mtb-ruta") ahora devuelve [] (vacío)
- Modificado categories.ts: preset mtb-ruta-general reemplazado por mtb-ruta-blank (categorías vacías)
- Modificado handleSportTypeChange en ambos archivos admin: cuando sportType === "mtb-ruta", NO auto-carga presets, deja categorías en ""
- Agregado mensaje visual especial cuando se selecciona MTB+Ruta: "Categorías en Blanco - crea tus categorías personalizadas"
- Verificado: sportTypeLabels NO contiene "seguridad" ni "recreativo" ✅
- Verificado: sportTypeLabels SÍ contiene "mtb-ruta": "MTB + Ruta (Combinado)" ✅
- Build exitoso
- Deploy a Vercel con --prod exitoso
- DIAGNÓSTICO CRÍTICO: La URL my-project-eosin-nine.vercel.app era de un proyecto ANTERIOR que ya no recibe deploys. La URL correcta del proyecto actual es https://my-project-venezuelabike-9338-venezuelabike-9338s-projects.vercel.app
- Actualizado CREDENCIALES-IMPORTANTES.txt con URL correcta

Stage Summary:
- MTB+Ruta ahora inicia con categorías en BLANCO - el admin las crea con el formulario personalizado
- URL de producción corregida: https://my-project-venezuelabike-9338-venezuelabike-9338s-projects.vercel.app
- URL del admin: https://my-project-venezuelabike-9338-venezuelabike-9338s-projects.vercel.app/admin
