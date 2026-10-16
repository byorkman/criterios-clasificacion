# Criterios diagnósticos

Herramienta web para aplicar los criterios diagnósticos y de clasificación más usados en reumatología pediátrica. Se marcan los hallazgos del paciente y muestra si cumple, con el detalle y un botón para copiar el resultado a la historia clínica. Pensada para usar desde el celular durante la consulta.

| Criterio | Fuente |
|---|---|
| Artritis idiopática juvenil (ILAR): categoría según hallazgos y exclusiones | Petty RE, et al. *J Rheumatol* 2004;31:390-2 |
| Lupus eritematoso sistémico (EULAR/ACR 2019): puntaje por dominios | Aringer M, et al. *Arthritis Rheumatol* 2019;71:1400-12 |
| Enfermedad de Kawasaki (AHA 2017): completa y algoritmo de la forma incompleta | McCrindle BW, et al. *Circulation* 2017;135:e927-99 |
| Vasculitis IgA o púrpura de Schönlein-Henoch (EULAR/PRINTO/PRES) | Ozen S, et al. *Ann Rheum Dis* 2010;69:798-806 |
| Síndrome de activación macrofágica en AIJ sistémica (2016) | Ravelli AM, et al. *Ann Rheum Dis* 2016;75:481-9 |

**No guarda ni envía datos.** Todo se hace en el navegador.

> ⚠️ **Los criterios tienen que ser revisados por un médico antes de usarse con pacientes.**

En AIJ, la exclusión (c) de ILAR se toma como presente si el paciente cumple artritis relacionada con entesitis, tiene uveítis anterior aguda o un familiar de primer grado con espondiloartritis. Si cumple más de una categoría o ninguna, la app la muestra como indiferenciada, igual que ILAR.

Todos los criterios están en `src/criterios.js`. Para agregar uno se suma un objeto a la lista `CRITERIOS` con sus campos y su función `evaluar`.

## Desarrollo

Sitio estático, sin dependencias ni compilación.

```sh
npm test               # pruebas
npx serve .            # o cualquier servidor estático para verlo localmente
```

## Versión

La versión se ve al pie de la página. En cada cambio:

1. Agregar arriba en [`CHANGELOG.md`](CHANGELOG.md) una entrada `## X.Y.Z · día mes año` con lo que cambió.
2. Poner el mismo número en `package.json` y el mismo texto (`vX.Y.Z · día mes año`) en el pie de `index.html`.

Se sube el último número para arreglos y textos, el del medio para funciones nuevas y el primero para cambios grandes. `npm test` avisa si los tres lugares no coinciden.

## Publicar en Vercel

En Vercel: **Add New → Project → Import** este repositorio, con Framework Preset **Other** y sin comando de build. Cada cambio que entre a `main` se publica solo.
