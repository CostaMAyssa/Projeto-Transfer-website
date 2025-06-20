  Como Funciona a Detecção de Zonas
O sistema não armazena todos os endereços das 7 zonas. Em vez disso, ele usa detecção geográfica inteligente:
 Para Aeroportos (EWR, JFK, LGA)
Detecção circular: Qualquer endereço dentro do raio definido é detectado
EWR: Raio de 2.4 milhas ao redor do aeroporto
JFK: Raio de 4.4 milhas
LGA: Raio de 2.4 milhas
  
 Migration concluída com sucesso!
 Estatísticas:
   • 7 zonas ativas
   • 3 categorias de veículos ativas  
   • 63 preços configurados

| #  | Origem  | Destino | Distância (mi) | Fares SEDAN / SUV / VAN |
| -- | ------- | ------- | -------------- | ----------------------- |
| 1  | **BKN** | **BRX** | 20             | 130 / 160 / 150         |
| 2  | **BKN** | **EWR** | 12.05          | 140 / 170 / 160         |
| 3  | **BKN** | **JFK** | 11             | 130 / 160 / 150         |
| 4  | **BKN** | **LGA** | 12             | 130 / 160 / 150         |
| 5  | **BKN** | **MAN** | 16             | 130 / 160 / 150         |
| 6  | **BKN** | **QNS** | 14             | 130 / 160 / 150         |
| 7  | **BRX** | **EWR** | 20.53          | 140 / 170 / 160         |
| 8  | **BRX** | **JFK** | 17             | 130 / 160 / 150         |
| 9  | **BRX** | **LGA** | 10             | 130 / 160 / 150         |
| 10 | **BRX** | **MAN** | 9              | 130 / 160 / 150         |
| 11 | **BRX** | **QNS** | 12             | 130 / 160 / 150         |
| 12 | **EWR** | **JFK** | 20.92          | 140 / 170 / 160         |
| 13 | **EWR** | **LGA** | 16.83          | 140 / 170 / 160         |
| 14 | **EWR** | **MAN** | 11.67          | 140 / 170 / 160         |
| 15 | **EWR** | **QNS** | 17.35          | 140 / 170 / 160         |
| 16 | **JFK** | **LGA** | 12             | 100 / 120 / 110         |
| 17 | **JFK** | **MAN** | 15             | 130 / 160 / 150         |
| 18 | **JFK** | **QNS** | 7              | 130 / 150 / 140         |
| 19 | **LGA** | **MAN** | 10             | 130 / 160 / 150         |
| 20 | **LGA** | **QNS** | 8              | 120 / 150 / 140         |
| 21 | **MAN** | **QNS** | 15             | 130 / 160 / 150         |



````
───────────────────── PROMPT INÍCIO ─────────────────────
**OBJETIVO**  
Gerar a implementação completa de um back-end (Supabase/PostgreSQL + Express) para tarifas de transporte entre zonas de NYC, com seed de dados, documentação OpenAPI e fluxo n8n de popular o banco.

**CONFIGURAÇÕES**  
- Linguagem principal: TypeScript (Node 20).  
- Banco: Supabase /PostgreSQL 15.  
- Auth: nenhuma por enquanto (chave anônima).  
- Ferramentas extras: n8n (para popular via REST).  
- Prefixo REST: `/api`.  

**DADOS DE NEGÓCIO**  
_Zonas e veículos_  
```json
{
  "zones": [
    { "id": "EWR", "name": "Aeroporto Internacional de Newark (EWR), NJ", "type": "airport", "radius_mi": 2.4 },
    { "id": "JFK", "name": "Aeroporto John F. Kennedy (JFK), NY",        "type": "airport", "radius_mi": 4.4 },
    { "id": "LGA", "name": "Aeroporto LaGuardia (LGA), NY",               "type": "airport", "radius_mi": 2.4 },
    { "id": "MAN", "name": "Manhattan, NY",                               "type": "borough" },
    { "id": "BKN", "name": "Brooklyn, NY",                                "type": "borough" },
    { "id": "BRX", "name": "Bronx, NY",                                   "type": "borough" },
    { "id": "QNS", "name": "Queens, NY",                                  "type": "borough" }
  ],
  "vehicle_categories": [
    { "id": "SEDAN", "label": "Toyota Camry ou similar" },
    { "id": "SUV",   "label": "Chevrolet Suburban ou similar" },
    { "id": "VAN",   "label": "Minivan" }
  ]
}
````

*Rotas (21 pares) + distâncias em milhas*

```json
[
  ["EWR","MAN",11.67], ["EWR","BKN",12.05], ["EWR","LGA",16.83],
  ["EWR","QNS",17.35], ["EWR","BRX",20.53], ["EWR","JFK",20.92],
  ["JFK","QNS",7   ], ["JFK","BKN",11], ["JFK","LGA",12],
  ["JFK","MAN",15], ["JFK","BRX",17],
  ["LGA","MAN",10], ["LGA","BRX",10], ["LGA","QNS",8], ["LGA","BKN",12],
  ["MAN","BKN",16], ["MAN","BRX",9], ["MAN","QNS",15],
  ["BKN","QNS",14], ["BKN","BRX",20],
  ["BRX","QNS",12]
]
```

*Tarifas básicas (por rota)*

| Par                                | SEDAN | SUV | VAN |
| ---------------------------------- | ----- | --- | --- |
| **EWR→**\*                         | 140   | 170 | 160 |
| **JFK→QNS**                        | 130   | 150 | 140 |
| **JFK→BKN / JFK→MAN / JFK→BRX**    | 130   | 160 | 150 |
| **JFK→LGA**                        | 100   | 120 | 110 |
| **LGA→MAN / BRX / BKN**            | 130   | 160 | 150 |
| **LGA→QNS**                        | 120   | 150 | 140 |
| **MAN / BKN / BRX / QNS internos** | 130   | 160 | 150 |

(onde não especificado acima, use 130 / 160 / 150)

**ENTREGAS QUE VOCÊ (GPT) DEVE PRODUZIR, NESSA ORDEM**

1. **SQL – Migrations**

   * Tabelas: `zones`, `vehicle_categories`, `zone_routes`, `route_base_fares`.
   * Constraints & índices (`UNIQUE(origin,dest)`, `CHECK(origin<>dest)`).

2. **SQL – Seed**

   * Inserts nas quatro tabelas usando os dados de negócio.

3. **Express App (`src/index.ts`)**

   * Conexão via `pg`.
   * Endpoints:

     * `GET /api/pricing?origin=ID&dest=ID&vehicle=ID` → `{ baseFare: number }`
     * CRUD simples para `zones` e `zone_routes`.
   * Validação básica (404 se rota inexistente).

4. **OpenAPI 3.1** (`openapi.yaml`) cobrindo todos os endpoints.

5. **Script Node (`scripts/import-seed.ts`)**

   * Lê `seed.json` e faz POSTs na API para popular banco (caso não use SQL direto).

6. **Fluxo n8n (export JSON)**

   * Nó **HTTP Request** para cada rota → cria zona, rota, depois 3 tarifas.
   * Use credencial HTTP Base URL = `{{ $.env.API_URL }}`.

7. **README.md**

   * Passo a passo para rodar migrations (`supabase db push`), startar API (`pnpm dev`), importar seed via n8n ou script.
   * Comandos: `pnpm install`, `pnpm dev`, `pnpm run import-seed`.

8. **Testes**

   * Jest: um teste que chama `GET /api/pricing?origin=MAN&dest=EWR&vehicle=SEDAN` e espera `140`.

**FORMATO DE ENTREGA**
Gerar cada arquivo em blocos markdown:

````markdown
### arquivo: migrations/001_init.sql
```sql
-- conteúdo
````

Repetir para todos os arquivos listados.
Não comente fora dos blocos de código — o cliente quer copiar/colar direto.

────────────────────── PROMPT FIM ──────────────────────

```

---

### Como usar

1. **Copie** o bloco completo acima.  
2. **Cole** no seu ChatGPT / GPT Builder favorito.  
3. O modelo retornará **todos os arquivos** (SQL, código, fluxo n8n, README, testes).  
4. Faça download ou copie cada bloco para o seu repositório.

> Se quiser que eu mesmo gere os arquivos agora, me avise — posso criar um ZIP ou mostrar cada pedaço aqui no chat.
```

