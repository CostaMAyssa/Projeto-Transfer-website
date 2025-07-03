# Plano de Implementação de Notificações por E-mail

## Objetivo
Implementar notificações por e-mail transacionais automáticas para os clientes após a confirmação bem-sucedida de um pagamento, utilizando os detalhes da reserva (`bookingData`), do pagamento (`paymentDetails`) e do `paymentIntent` para construir o conteúdo do e-mail. O ponto de inserção da lógica será dentro do bloco `if (paymentIntent.status === 'succeeded')` na função `process-payment` do Supabase Edge Functions.

## Detalhes da Implementação

### 1. Escolha do Serviço de E-mail
Para o envio de e-mails transacionais, é recomendável utilizar um serviço robusto e escalável. Escolhemos o **SendGrid** devido à sua robustez, escalabilidade e ampla documentação.

**Próximo Passo:** Prosseguiremos com a configuração das credenciais do SendGrid.

### 2. Configuração de Credenciais
Independentemente do serviço escolhido, será necessário configurar as chaves de API ou credenciais SMTP como variáveis de ambiente no projeto Supabase. Isso garante que as informações sensíveis não sejam expostas no código-fonte.

*   Para o SendGrid, a variável de ambiente necessária é:
    *   `SENDGRID_API_KEY`

**Próximo Passo:** O usuário deverá configurar a `SENDGRID_API_KEY` nas variáveis de ambiente do projeto Supabase. Vou instruir como fazer isso.

### 3. Adicionar Lógica de Envio de E-mail
O código para enviar o e-mail será inserido no arquivo `supabase/functions/process-payment/index.ts`, especificamente dentro do bloco `if (paymentIntent.status === 'succeeded')`. Utilizaremos o SDK ou a API HTTP do serviço de e-mail escolhido para construir e enviar o e-mail.

*   **Estrutura do E-mail:**
    *   **Remetente:** `no-reply@seu-dominio.com` (configurável)
    *   **Destinatário:** O e-mail do cliente (`bookingData.customerEmail` ou similar)
    *   **Assunto:** "Confirmação da sua Reserva Transfero" (ou similar)
    *   **Corpo do E-mail:** Conterá um resumo da reserva (origem, destino, data, hora, tipo de veículo, extras, preço) e detalhes do pagamento. Poderemos usar um template HTML simples ou construir o corpo em texto puro, dependendo da complexidade desejada.

**Próximo Passo:** Com o serviço de e-mail definido, implementaremos o código TypeScript para o envio.

### 4. Detalhes do E-mail e Dados Usados
Os seguintes dados serão utilizados para compor o e-mail:

*   `bookingData`: Contém informações da reserva, como origem, destino, datas, horários, detalhes do veículo, passageiros e quaisquer extras.
*   `paymentDetails`: Detalhes específicos do pagamento, se disponíveis.
*   `paymentIntent`: Objeto do Stripe que confirma o status de sucesso do pagamento.

**Próximo Passo:** Refinaremos o conteúdo exato do e-mail durante a implementação do código.

## Resumo dos Próximos Passos
1.  **Usuário escolhe o serviço de e-mail.**
2.  **Configuramos as variáveis de ambiente no Supabase.**
3.  **Implementamos a lógica de envio de e-mail no `process-payment/index.ts`.**
4.  **Testamos a funcionalidade.** 