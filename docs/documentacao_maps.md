### Passo-a-passo (oficial, segundo a documentação) para gerar e usar a **Google Maps JavaScript API key**

| Etapa                                 | O que fazer no Console                                                                                                                                                                                                  | Trecho da documentação                                                                         |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| **1 · Criar ou selecionar projeto**   | <br>1. Acesse **Google Cloud Console → Select Project → New Project** <br>2. Dê um nome, ex.: `aztransfer-prod`                                                                                                         | “Set up your Google Cloud project” ([developers.google.com][1])                                |
| **2 · Ativar as APIs**                | Menu **APIs & Services › Library** → pesquise e **ENABLE**: <br>• Maps JavaScript API <br>• Directions API <br>• Geocoding API <br>• Places API (para autocomplete)                                                     | “Enable the APIs and SDKs” ([developers.google.com][1])                                        |
| **3 · Criar a chave**                 | **APIs & Services › Credentials › + Create credentials › API key**                                                                                                                                                      | “Click *Create credentials › API key*” ([developers.google.com][2])                            |
| **4 · Restringir**                    | Depois de criada, clique na chave: <br>• *Application restrictions*: **HTTP referrers** → adicione `https://aztransfergroup.com/*` e `http://localhost:5173/*` <br>• *API restrictions*: marque apenas as APIs ativadas | “Remember to restrict the API key before using it in production.” ([developers.google.com][2]) |
| **5 · Configurar cobrança & alertas** | Menu **Billing › Budgets** → alerta em US\$ 50                                                                                                                                                                          | prática recomendada de segurança ([developers.google.com][3])                                  |

---

#### Como carregar a biblioteca no seu projeto React + Vite

```bash
# instala o loader oficial
npm i @googlemaps/js-api-loader
```

```ts
// src/lib/googleMaps.ts
import { Loader } from '@googlemaps/js-api-loader';

const loader = new Loader({
  apiKey: import.meta.env.VITE_MAPS_API_KEY!,
  version: 'weekly',                        // recomendado pela doc
  libraries: ['geometry', 'places', 'drawing'],
});

export async function initMap(container: HTMLElement) {
  await loader.importLibrary('maps');       // lazy-load
  const { Map, Circle } = google.maps;

  const map = new Map(container, {
    center: { lat: 40.6895, lng: -74.1745 }, // Newark
    zoom: 11,
  });

  // exemplo de zona circular
  new Circle({
    map,
    center: { lat: 40.6895, lng: -74.1745 },
    radius: 3862,           // 2.4 mi em metros
    strokeColor: '#6633cc',
    fillColor: '#6633cc',
    fillOpacity: 0.1,
  });

  return map;
}
```

`.env.local` (não versionado):

```
VITE_MAPS_API_KEY=AIzaSy...
```

---

### Checklist rápido depois de gerar a chave

1. **Copiou** e guardou em local seguro.
2. **Restrição** de referer + APIs feita.
3. **Billing alert** criado.
4. Chave lida **via variável de ambiente**, nunca hard-coded.
5. Script/Loader inclui `version: 'weekly'` e `libraries` necessárias.

Seguindo exatamente esses passos — que são os mesmos do guia oficial — sua chave funcionará sem erro e estará protegida contra uso indevido.

[1]: https://developers.google.com/maps/documentation/javascript/cloud-setup?utm_source=chatgpt.com "Set up your Google Cloud project | Maps JavaScript API"
[2]: https://developers.google.com/maps/documentation/javascript/get-api-key?utm_source=chatgpt.com "Use API Keys | Maps JavaScript API - Google for Developers"
[3]: https://developers.google.com/maps/api-security-best-practices?utm_source=chatgpt.com "Google Maps Platform security guidance"
