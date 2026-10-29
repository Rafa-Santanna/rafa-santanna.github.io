# KEEP — Loja de artigos esportivos

Protótipo funcional de e-commerce em **HTML, CSS e JavaScript puro**, inspirado na imagem fornecida.

## Como executar

1. Extraia o ZIP da pasta `KEEP-loja`.
2. Abra a pasta no VS Code.
3. Abra `index.html` no navegador. Para desenvolvimento, você também pode usar a extensão **Live Server** do VS Code e clicar em **Open with Live Server**.

A página não precisa de Node, npm, banco de dados ou instalação de dependências.

## Organização

- `index.html`: estrutura semântica da página, modais, formulário e navegação.
- `styles.css`: estilização desktop e responsiva.
- `app.js`: catálogo, detalhes, filtros, favoritos, quantidades, carrinho, perfil e simulação de pedido.
- `assets/`: imagens recortadas da referência que você enviou e favicon SVG.

## Funcionalidades

- Clique na **foto ou nome** de um produto para abrir os detalhes.
- Selecione o tamanho e a quantidade, visualize a foto ampliada e adicione ao carrinho.
- O carrinho permite aumentar, diminuir e remover itens, além de mostrar o subtotal.
- Pesquise por produtos e filtre pelos esportes das coleções.
- Favorite itens pelo coração e visualize apenas os favoritos.
- Finalize uma **simulação de pedido**. O histórico, os favoritos e o carrinho são armazenados localmente no navegador.
- Interface adaptada a computador e celular.

## Importante sobre vendas reais

O **checkout é demonstrativo**: não cobra pagamentos, não registra pedidos em um servidor, não consulta frete/estoque e não envia e-mails. Para realizar vendas de verdade, é preciso acrescentar back-end, banco de dados, autenticação, administração de estoque, integrações de frete e gateway de pagamento (por exemplo, Mercado Pago ou Stripe). Os dados e benefícios comerciais exibidos são ilustrativos.

## Personalizar produtos

Edite o array `PRODUCTS` no início de `app.js` para mudar nomes, preços, imagens, descrições, categorias e tamanhos. Todos os preços são definidos como números (por exemplo, `89.90`).

## Licença das imagens

Os recursos visuais deste protótipo foram extraídos da imagem enviada como referência e devem ser utilizados respeitando os direitos do material original.
