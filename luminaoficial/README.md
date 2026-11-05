# Lúmina Personaliza — novo site

Site estático em HTML/CSS/JS, pronto para GitHub Pages, Netlify, Vercel ou hospedagem tradicional.

## Estrutura

- `index.html` — página principal
- `css/style.css` — visual responsivo
- `js/produtos.js` — catálogo de produtos
- `js/app.js` — filtros, pesquisa, modal e WhatsApp
- `assets/produtos/` — coloque aqui as fotos reais

## WhatsApp

O número usado no projeto é o telefone público informado para a Lúmina: `(51) 99402-7139`.

Se precisar alterar:
`js/app.js` → constante `WHATSAPP`.

## Como trocar as fotos

Os nomes esperados estão em `js/produtos.js`, por exemplo:

`assets/produtos/caneca.jpg`
`assets/produtos/camiseta.jpg`
`assets/produtos/banner.jpg`

Se uma foto ainda não existir, o site mostra automaticamente um placeholder.

## Como adicionar produto

Abra `js/produtos.js` e acrescente um objeto no array `produtos`:

{
  id: 19,
  nome: "Novo Produto",
  categoria: "Brindes",
  icone: "🎁",
  descricao: "Descrição curta.",
  recursos: ["Opção 1", "Opção 2"],
  imagem: "assets/produtos/novo-produto.jpg"
}

Categorias disponíveis:
- Brindes
- Vestuário
- Papelaria
- Gráfica
- MDF & Laser
- Adesivos

## Observação

Textos, categorias, endereço, horários e produtos devem ser validados pela Lúmina antes da publicação definitiva. O site foi estruturado para catálogo e solicitação de orçamento, não para checkout/e-commerce.
