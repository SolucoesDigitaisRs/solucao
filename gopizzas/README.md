# GO PIZZAS — Página de Pedidos

Versão inicial de uma página responsiva de pedidos.

## Fluxo
1. Cliente escolhe os produtos.
2. Adiciona ao carrinho.
3. Escolhe entrega ou retirada.
4. Informa dados.
5. Escolhe pagamento no local.
6. Confere o resumo.
7. O pedido é montado e enviado ao WhatsApp.

## WhatsApp
Número inicial configurado em `app.js`:
`5551993453884`

Para trocar depois, altere apenas:
`CONFIG.whatsapp`
e, se quiser, `CONFIG.whatsappDisplay`.

## Arquivos
- `index.html` — estrutura da página
- `styles.css` — identidade visual e responsividade
- `app.js` — produtos, carrinho, checkout e WhatsApp
- `assets/` — imagens da identidade visual

## Observações
- A taxa de entrega ainda está configurada como "a confirmar", pois o valor/regra não foi informado.
- O horário de atendimento pode ser alterado em `CONFIG.openingTime` e `CONFIG.closingTime`, no formato `HH:MM`. O status de pedidos e o rodapé são atualizados automaticamente usando a hora local do dispositivo.
- Cada produto possui o campo `image` em `app.js`. Informe o caminho da imagem (por exemplo, `assets/pizzas/calabresa.jpg`) para substituir o espaço reservado exibido no card.
- O hero usa uma imagem para desktop (`assets/pizza-detalhe.jpg`) e outra para dispositivos móveis (`assets/cardapio-original.jpg`). Esses caminhos podem ser trocados nas regras `.hero` e `@media (max-width: 640px)` de `styles.css`.
- A opção `Monte sua pizza` permite escolher de 1 a 4 sabores de pizza, sem incluir bebidas, pelo preço fixo configurado em `CONFIG.customPizzaPrice` no `app.js`.
- Foram adicionadas proteções básicas contra cópia casual: bloqueio do menu de contexto, seleção de conteúdo, arraste de imagens e atalhos comuns de inspeção. Essas medidas não substituem proteção real, pois qualquer código enviado ao navegador pode ser visualizado por usuários avançados.
- No checkout, o botão `Revisar pedido` mostra os itens, dados do cliente, endereço ou retirada, pagamento e observações antes da confirmação de envio pelo WhatsApp.
- O painel administrativo não faz parte desta primeira versão.
- O projeto não depende de servidor para o fluxo básico: é uma página estática.
