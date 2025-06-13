# 🔍 **AUDITORIA REVISADA PARA “ZONE PRICING” – *versão preenchida com os seus dados atuais***

> **Escopo confirmado**
> • Portal público, **sem login** nem criação de conta.
> • Base técnica já em uso: **React + Mapbox GL JS**, Supabase e Stripe.
> • Cobertura: **NY, NJ, PA, CT**.
> • Categorias de veículo e preços fixos definidos abxaixo.

---

## 1️⃣ **DEFINIÇÃO E CADASTRO DE ZONAS**

### 🗺️ Zonas que precisam ser criadas (já mapeadas no Moovs)

| ID       | Nome da Zona                    | Descrição Curta       | Tipo      |
| -------- | ------------------------------- | --------------------- | --------- |
| Z\_EWR   | Aeroporto Intl. Newark (EWR)    | Círculo 2,4 mi radius | Circular  |
| Z\_JFK   | Aeroporto John F. Kennedy (JFK) | Círculo 4,4 mi radius | Circular  |
| Z\_LGA   | Aeroporto LaGuardia (LGA)       | Círculo 2,4 mi radius | Circular  |
| Z\_BRONX | Bronx, NY                       | 25 ZIP Codes          | Poligonal |
| Z\_BKLYN | Brooklyn, NY                    | 38 ZIP Codes          | Poligonal |
| Z\_MHTN  | Manhattan, NY                   | 55 ZIP Codes          | Poligonal |
| Z\_QNS   | Queens, NY                      | 56 ZIP Codes          | Poligonal |

> **Observação**: Staten Island poderá ser incluída futuramente (① decidir).

### Detalhes geo de cada zona

| ID       | Centro Lat | Centro Lng | Raio (m) | GeoJSON/Arquivo   | Descrição                                 |
| -------- | ---------- | ---------- | -------- | ----------------- | ----------------------------------------- |
| Z\_EWR   | 40.6895    | -74.1745   | 3 862    | –                 | Aeroporto Intl. Newark + entorno imediato |
| Z\_JFK   | 40.6413    | -73.7781   | 7 080    | –                 | Aeroporto JFK                             |
| Z\_LGA   | 40.7769    | -73.8740   | 3 862    | –                 | Aeroporto LaGuardia                       |
| Z\_BRONX | –          | –          | –        | bronx.geojson     | Borough do Bronx                          |
| Z\_BKLYN | –          | –          | –        | brooklyn.geojson  | Borough de Brooklyn                       |
| Z\_MHTN  | –          | –          | –        | manhattan.geojson | Borough de Manhattan                      |
| Z\_QNS   | –          | –          | –        | queens.geojson    | Borough de Queens                         |

*(Lat/Lng e raios baseados nos círculos originais do Moovs; pode ajustar após validação GIS.)*

---

## 2️⃣ **CATEGORIAS DE VEÍCULOS E TARIFAS**

### 🚗 Categorias ofertadas (fixas)

| Categoria   | Exemplo / Observação       | Capacidade | Preço FIXO\*  |
| ----------- | -------------------------- | ---------- | ------------- |
| **SUV**     | Chevrolet Suburban ou sim. | 6 pax      | **USD 1 150** |
| **Sedan**   | Toyota Camry ou sim.       | 3 pax      | **USD  750**  |
| **Minivan** | Chrysler Pacifica ou sim.  | 7 pax      | **USD 1 300** |

\* Valores atuais para qualquer trajeto origem→destino dentro da cobertura; serão refinados quando a matriz por zona × zona estiver concluída.

### 💰 Matriz de preços (exemplo inicial – precisa validar)

| Origem  | Destino  | Sedan (\$) | SUV (\$) | Minivan (\$) |
| ------- | -------- | ---------- | -------- | ------------ |
| Z\_EWR  | Z\_MHTN  | 750        | 1 150    | 1 300        |
| Z\_JFK  | Z\_MHTN  | 750        | 1 150    | 1 300        |
| Z\_LGA  | Z\_BKLYN | 750        | 1 150    | 1 300        |
| Z\_MHTN | Z\_BKLYN | 750        | 1 150    | 1 300        |

> • Como **preço é fixo**, usar o mesmo valor para todos os pares até que o cliente informe variações.
> • Caso adote tarifa dinâmica futura, aplicar multiplicadores (pico 1,5×, fim--semana 1,2×, feriado 1,3×).

---

## 3️⃣ **INTEGRAÇÕES E APIs**

| Decisão                    | Situação     | Ação                                    |
| -------------------------- | ------------ | --------------------------------------- |
| **Mapbox**                 | Já integrado | **Manter**; nenhuma chave extra         |
| **Geocoding**              | Necessário   | Usar Mapbox Geocoding; \~10 k req/mês   |
| **Directions**             | Necessário   | Mapbox Directions para rota e distância |
| **Distance-based pricing** | *não*        | Dispensa Distance Matrix                |

---

## 4️⃣ **REGRAS DE NEGÓCIO (SEM LOGIN)**

| Questão                         | Escolha                                   | Observação                                                 |
| ------------------------------- | ----------------------------------------- | ---------------------------------------------------------- |
| Pickup fora de zona             | **Aceitar com preço “fora de cobertura”** | Valor fixo adicional a definir                             |
| Tolerância                      | 300 m                                     | Se dentro dessa margem usa zona mais próxima               |
| Sobreposição                    | Zona **mais específica (menor)**          | Ex.: ponto dentro do círculo do aeroporto domina o borough |
| Rotas atravessando várias zonas | **Cobrar só origem→destino**              | Simplifica para cliente                                    |
| Lead fora de cobertura          | Mostrar msg + botão **WhatsApp**          | Abre chat comercial                                        |

---

## 5️⃣ **FORMATOS DE ENTRADA / SAÍDA**

* Upload inicial em **CSV** (zonas e preços).
* JSON exposto via endpoint `/api/zones` e `/api/pricing`.
* Admin GUI poderá ser adicionada na fase 2.

---

## 6️⃣ **DADOS & TABELAS (SUPABASE)**

Estrutura SQL já compatível com PostGIS (veja seção anterior). Apenas remover colunas de usuário/autenticação.

---

## 7️⃣ **CHECKLIST DE IMPLEMENTAÇÃO**

1. **Importar zonas** (circular + GeoJSON) no Supabase.
2. **Seed de preços** fixos com base na matriz acima.
3. **Endpoint `/api/pricing/calculate`** → retorna total.
4. **Validação geográfica** (ST\_Intersects / ST\_DWithin 300 m).
5. **Integração frontend** – substituir mock do Moovs pelo novo endpoint.
6. **Teste E2E**:

   * EWR → Manhattan (SUV) = 1 150 USD
   * Fora de zona → aplica “fora de cobertura” + abre WhatsApp.
7. **Deploy** + monitoramento Mapbox quota.

---


