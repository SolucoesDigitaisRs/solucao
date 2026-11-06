const produtos = [
  {id:1,
    preco:60.00,
    nome:"Copo Térmico",
    categoria:"Brindes",
    icone:"☕",
    descricao:"Copo térmico inox personalizado para presentes, empresas e eventos.",
    recursos:["para pedidos acima de 10 un consultar valores","Personalização conforme projeto","Ideal para presentes e brindes"],
    imagem:"assets/produtos/copo_termico_lumina.jpg"},
    
  {id:2,
    preco:20.00,
    nome:"🪵 Placa Decorativa em Madeira Personalizada – Árvore da Família",
    categoria:"Brindes",
    icone:"🥤",
    descricao:"Traga aconchego, elegância e significado para a decoração do seu lar com a nossa Placa Decorativa de Madeira Personalizada.",
    recursos:[" ✨ Destaques do Produto: Gravação a Laser de Alta Definição: Detalhes nítidos na ilustração e na tipografia, garantindo excelente legibilidade e durabilidade. "],
    imagem:"assets/madeira_laser.jpg"}, 
 
  {id:3,
    preco:5.00,
    nome:"Chaveiro em MDF",
    categoria:"Chaveiro",
    icone:"🔑",
    descricao:"Personalizados com o que preferir, acima de 20 un consultar valores.",
    recursos:["Corte e gravação","Formatos personalizados","Ótimo para eventos e brindes"],
    imagem:"assets/produtos/chaveiro/chaveiro1.jpeg"},

  {id:4,
    preco:60.00,
    nome:"Camiseta Personalizada Infantil com seu logo",
    categoria:"Vestuário",
    icone:"👜",
    descricao:"Camisetas infantis todas as cores personalizadas para empresas, equipes, eventos e presentes.",
    recursos:["pedidos acima de  15 un consultar valores","Algodão ou poliéster","Personalização com sua arte","Consulte modelos e tamanhos"],
    imagem:"assets/produtos/vestuario/camiseta.jpg"},

  {id:5,
    preco:80.00,
    nome:"Camisetas personalizadas com logomarca",
    categoria:"Vestuário",
    icone:"👜",
    descricao:"Todas as cores disponíveis para campanhas, empresas, eventos e presentes.",
    recursos:["Personalização conforme projeto","Ideal para ações promocionais","Consulte tamanho e modelos disponíveis"],
    imagem:"assets/produtos/vestuario/lumina.jpg"},

  {
    id:6,
    preco: 55.00,
    nome: "Capas e estojos (couro sintético, couro)",
    categoria: "Papelaria", 
    icone: "📔",
    descricao: "Capas e estojos em couro sintético e couro de alta qualidade, personalizados com gravação a laser para um acabamento exclusivo e sofisticado.",
    recursos: [
      "Material em couro sintético ou couro",
      "Personalização opcional conforme projeto",
      "Para pedidos corporativos acima de 10 un - consultar valores"
    ],
    imagem: "assets/produtos/papelaria/caderno3.jpg"
  },

  {id:7,
    preco:45.00,
    nome:"Cadernos e agendas Personalizado",
    categoria:"Papelaria",
    icone:"📓",
    descricao:"Cadernos e agendas personalizados com opções de capa em MDF, bamboo ou couro, perfeitos para presentear ou para uso corporativo..",
    recursos: [
      "Capa em MDF, bamboo ou couro",
      "Personalização conforme projeto",
      "Para pedidos corporativos - consultar valores"
    ],    
    imagem:"assets/produtos/papelaria/caderno.jpg"},

  {id:8,
    preco:35.00,
    nome: "Cadernos (capas, couro, papel, etc.)",
    categoria:"Papelaria",
    icone:"📝",
    descricao:"Cadernos com diversas opções de capas em couro, papel e outros materiais, oferecendo um acabamento elegante e personalizado.",
    recursos:["Diversas opções de capas (couro, papel, etc.)",
      "Personalização opcional conforme projeto",
      "Para pedidos corporativos acima de 10 un - consultar valores"],
    imagem:"assets/produtos/papelaria/caderno2.jpg"},

  {
    id: 11,
    preco: 15.00,
    nome: "Chaveiro para pet (metal, madeira, acrílico, etc.)",
    categoria: "Chaveiro",
    icone: "🐾",
    descricao: "Chaveiros e identificadores para pets disponíveis em diversos materiais como metal, madeira e acrílico, perfeitos para a segurança e identificação do seu animal de estimação.",
    recursos: [
      "Disponível em metal, madeira, acrílico, etc.",
      "Personalização opcional com nome e contato",
      "Para pedidos acima de 10 un - consultar valores"
    ],
    imagem: "assets/produtos/chaveiro/chaveiro_pet.jpg"
  },

  {id:12,
    preco:15.00,
    nome:"Chaveiro abridor (metal)",
    categoria:"Chaveiro",
    icone:"🔑",
    descricao:"Chaveiro abridor de metal resistente e sofisticado, ideal para brindes corporativos, lembranças ou uso diário com gravação personalizada.",
    recursos:[
      "Material em metal de alta durabilidade",
      "Função dupla de chaveiro e abridor de garrafas",
      "Personalização opcional conforme projeto",
      "Para pedidos acima de 10 un - consultar valores"
    ],
    imagem:"assets/produtos/chaveiro/chaveiro_abridor.jpg"},

  {id:15,
    preco:20.00,
    nome:"Adesivo Transparente",
    categoria:"Adesivos",
    icone:"🏷️",
    descricao:"Adesivos transparentes personalizados de alta qualidade, ideais para destacar a marca em embalagens, produtos e superfícies lisas com um acabamento discreto e elegante.",
    recursos:[
      "Material transparente de alta durabilidade e brilho",
      "Impressão nítida com excelente aderência",
      "Ideal para personalização de embalagens e produtos diversos",
      "Para pedidos acima de 10 un - consultar valores"
    ],
    imagem:"assets/produtos/adesivos/adesivo_transparente.jpg"},

  {id:16,
    preco:15.00,
    nome:"Adesivo Vinílico",
    categoria:"Adesivos",
    icone:"✨",
    descricao:"Adesivos vinílicos para identificação, decoração e comunicação visual.",
    recursos:["Material vinílico","Diversos formatos","Consulte aplicação e acabamento","+ de 10 consulte valores"],
    imagem:"assets/produtos/adesivos/adesivo.jpg"},

  {id:17,
    preco:15.00,
    nome:"Adesivos e Lacres para Sacolas",
    categoria:"Adesivos",
    icone:"🎨",
    descricao:"Adesivos e lacres personalizados para fechamento de sacolas de papel, perfeitos para agregar valor às entregas e reforçar a identidade visual da sua marca.",
    recursos:[
      "Papel adesivo com corte especial no contorno",
      "Ideal para fechar sacolas e embalagens de presente",
      "Personalização com logo, redes sociais e mensagem de agradecimento",
      "Para pedidos acima de 50 un - consultar valores"
    ],
    imagem:"assets/produtos/adesivos/adesivo1.jpg"},

  {id:18,
    preco:80.00,
    nome:"Caneca chopp inox",
    categoria:"Brindes",
    icone:"🧲",
    descricao:"opcional personalizar, pedidos acima de 10 un consultar valores.",
    recursos:["Formato personalizado","Personalização com sua arte","Ideal para brindes"],
    imagem:"assets/produtos/brindes/canecachop.jpg"},

  {id:19,
    preco:130.00,
    nome:"Tábua de carne",
    categoria:"MDF & Laser",
    icone:"🪵",
    descricao:"Tábua de carne com garra ou tridente  ( opcional personalizar, pedidos acima de 10 un consultar valores)",
    recursos:["Nome, frase ou data personalizados","Acabamento conforme o projeto","Consulte tamanhos disponíveis"],
    imagem:"assets/produtos/mdf/tabuadecarne.jpg"},

  {id:20,
    preco: 50.00,
    nome: "Petisqueiras (3 modelos disponíveis)",
    categoria: "MDF & Laser", // Ou "Brindes", conforme sua preferência
    icone: "🧀",
    descricao: "Petisqueira em madeira disponível em 3 modelos diferentes. Perfeita para receber amigos, servir petiscos com elegância ou presentear.",
    recursos: ["Disponível em 3 modelos diferentes", "Personalização opcional conforme projeto", "Pedidos acima de 10 un - consultar valores"],
    imagem: "assets/produtos/mdf/petisqueira.jpeg"},

  {id:21,
    preco: 60.00,
    nome: "Tábua de carne simples",
    categoria: "MDF & Laser",
    icone: "🥩",
    descricao: "Tábua de carne simples e resistente, excelente para o preparo de alimentos ou para o churrasco do dia a dia.",
    recursos: ["Personalização opcional conforme projeto", "Para pedidos acima de 10 un - consultar valores", "Ideal para uso diário e churrasco"],
    imagem: "assets/produtos/mdf/tabua_carne.jpeg"},

  {id:22,
    preco:8.00,
    nome:"Chaveiro em Acrílico",
    categoria:"Chaveiro",
    icone:"🔑",
    descricao:"Chaveiro personalizado (opcional) em acrílico para lembranças, presentes e brindes.",
    recursos:["Personalização com nome, frase ou arte","Cores e formatos conforme disponibilidade","Ideal para eventos e presentes"],
    imagem:"assets/produtos/chaveiro/chaveiro3.jpeg"},

  {id:23,
    preco:15.00,
    nome:"Chaveiro em couro",
    categoria:"Chaveiro",
    icone:"🗝️",
    descricao:"Chaveiro personalizado (opcional) para empresas, eventos e ações promocionais.",
    recursos:["para pedidos acima de 10 unidades consultar valores)","Personalização com logotipo","Opções conforme o projeto","Consulte quantidades para brindes"],
    imagem:"assets/produtos/chaveiro/chaveiro2.jpeg"},

  {id:24,
    preco:50.00,
    nome:"Boné Personalizado",
    categoria:"Vestuário",
    icone:"🧢",
    descricao:"Boné personalizado para empresas, equipes, eventos e presentes. Consultar cores e tamanhos",
    recursos:["acima de 25 unidades - 30,00","Personalização com sua arte ou logotipo","Modelos conforme disponibilidade","Consulte cores e tamanhos"],
    imagem:"assets/produtos/vestuario/bone.jpeg"},

  // Novos Brindes (IDs de 25 a 39)
  {
    id: 25,
    preco: 8.00,
    nome: "Canelinhas personalizadas",
    categoria: "Brindes",
    icone: "🎁",
    descricao: "Personalize como preferir! Uma ótima opção para presentear ou destacar sua marca.",
    recursos: ["Personalização conforme projeto", "Pedidos acima de 20 unidades: consulte valores"],
    imagem: "assets/produtos/brindes/canelinha.jpeg"
  },
  {
    id: 26,
    preco: 8.00,
    nome: "Canetas personalizadas",
    categoria: "Brindes",
    icone: "🖊️",
    descricao: "Canetas personalizadas com sua marca ou frase. Excelente opção para brindes corporativos, eventos e lembranças.",
    recursos: ["Pedidos acima de 20 unidades - consultar valores", "Personalização conforme projeto", "Consulte opções e valores"],
    imagem: "assets/produtos/brindes/canetas.jpeg"
  },
  {
    id: 27,
    preco: 3.00,
    nome: "Caneta ecológica",
    categoria: "Brindes",
    icone: "🌱",
    descricao: "Caneta ecológica sustentável com detalhes personalizados. Uma excelente escolha para empresas e eventos que valorizam a sustentabilidade.",
    recursos: ["Pedidos acima de 20 unidades - consultar valores", "Personalização conforme projeto", "Opção sustentável para brindes"],
    imagem: "assets/produtos/brindes/caneta2.jpg"
  },
  {
    id: 28,
    preco: 60.00,
    nome: "Copo térmico inox personalizado",
    categoria: "Brindes",
    icone: "☕",
    descricao: "Disponível em todas as cores. Excelente para manter sua bebida na temperatura ideal e presentear com estilo.",
    recursos: ["Pedidos acima de 10 unidades - consultar valores", "Todas as cores disponíveis", "Personalização conforme projeto"],
    imagem: "assets/produtos/brindes/copo_termico.jpeg"
  },
  {
    id: 29,
    preco: 70.00,
    nome: "Copo térmico inox com canudo",
    categoria: "Brindes",
    icone: "🥤",
    descricao: "Copo térmico inox com canudo, ideal para o dia a dia, passeios ou eventos. Mantém sua bebida favorita na temperatura ideal por muito mais tempo.",
    recursos: ["Pedidos acima de 10 unidades - consultar valores", "Personalização opcional com sua arte ou logo", "Acompanha canudo"],
    imagem: "assets/produtos/brindes/copo_termico_corres.jpeg"
  },
  {
    id: 30,
    preco: 60.00,
    nome: "Caneca chopp de vidro 450ml",
    categoria: "Brindes",
    icone: "🍺",
    descricao: "Caneca de chopp de vidro com capacidade de 450ml, personalizada para eventos, presentes ou para curtir momentos especiais.",
    recursos: ["Pedidos acima de 10 unidades - consultar valores", "Personalização conforme projeto", "Capacidade de 450ml"],
    imagem: "assets/produtos/brindes/copo_chop2.jpeg"
  },
  {
    id: 31,
    preco: 100.00,
    nome: "Cuia e bomba tereré redonda ou quadrada",
    categoria: "Brindes",
    icone: "🧉",
    descricao: "Kit com cuia e bomba para tereré, disponível em formatos redondo ou quadrado. Excelente opção para uso diário, presentes ou brindes especiais.",
    recursos: ["Personalização opcional conforme projeto", "Modelos redondo ou quadrado disponíveis", "Consulte opções e valores para quantidades"],
    imagem: "assets/produtos/brindes/cunha_bomba.jpeg"
  },
  {
    id: 32,
    preco: 50.00,
    nome: "Cuia porongo pé de metal",
    categoria: "Brindes",
    icone: "🧉",
    descricao: "Cuia tradicional de porongo com elegante pé de metal. Perfeita para apreciar o chimarrão com qualidade e estilo.",
    recursos: ["Personalização opcional conforme projeto", "Pedidos corporativos acima de 10 unidades - consultar valores", "Acabamento com pé de metal"],
    imagem: "assets/produtos/brindes/cunha1.jpeg"
  },
  {
    id: 33,
    preco: 45.00,
    nome: "Cuia porongo pé de massa",
    categoria: "Brindes",
    icone: "🧉",
    descricao: "Cuia tradicional de porongo com pé de massa. Ótima opção para o chimarrão do dia a dia ou para presentear com estilo.",
    recursos: ["Personalização opcional conforme projeto", "Para pedidos corporativos acima de 10 un - consultar valores", "Acabamento tradicional em pé de massa"],
    imagem: "assets/produtos/brindes/cunha2.jpeg"
  },
  {
    id: 34,
    preco: 70.00,
    nome: "Cuia de madeira (envernizada ou não)",
    categoria: "Brindes",
    icone: "🪵",
    descricao: "Cuia de madeira resistente e durável, disponível nas opções envernizada ou natural. Excelente para saborear o seu chimarrão.",
    recursos: ["Personalização opcional conforme projeto", "Para pedidos acima de 10 un - consultar valores", "Disponível nas opções envernizada ou natural"],
    imagem: "assets/produtos/brindes/cunha3.jpeg"
  },
  {
    id: 35,
    preco: 45.00,
    nome: "Bomba chimarrão inox personalizada",
    categoria: "Brindes",
    icone: "✨",
    descricao: "Bomba para chimarrão em aço inox de alta qualidade, com opção de personalização para deixar ainda mais exclusiva ou presentear.",
    recursos: ["Personalização conforme projeto", "Material em aço inox durável", "Para pedidos acima de 10 un - consultar valores"],
    imagem: "assets/produtos/brindes/cunha4.jpeg"
  },
  {
    id: 36,
    preco: 150.00,
    nome: "Kit 4 espetos personalizados com suporte",
    categoria: "Brindes",
    icone: "🍢",
    descricao: "Kit completo com 4 espetos e suporte, ideal para o churrasco de fim de semana, presentes especiais ou brindes corporativos marcantes.",
    recursos: ["Personalização conforme projeto", "Acompanha 4 espetos e suporte", "Para pedidos acima de 20 un - consultar valores"],
    imagem: "assets/produtos/brindes/espeto.jpeg"
  },
  {
    id: 37,
    preco: 100.00,
    nome: "Faca churrasco personalizada",
    categoria: "Brindes",
    icone: "🔪",
    descricao: "Faca para churrasco de alta qualidade, com opção de personalização diretamente na lâmina de inox ou no cabo de madeira. Um excelente presente ou brinde.",
    recursos: ["Personalização na parte em inox ou na madeira", "Ideal para presentes e churrascos", "Para pedidos acima de 10 un - consultar valores"],
    imagem: "assets/produtos/brindes/faca.jpeg"
  },
  {
    id: 38,
    preco: 250.00,
    nome: "Kit tereré",
    categoria: "Brindes",
    icone: "🧉",
    descricao: "Kit completo para tereré, ideal para quem aprecia momentos de lazer com qualidade e estilo. Excelente opção para presentear.",
    recursos: ["Personalização opcional conforme projeto", "Kit completo para tereré", "Consulte opções e valores para quantidades"],
    imagem: "assets/produtos/brindes/kit_terere.jpeg"
  },
  {
    id: 39,
    preco: 70.00,
    nome: "Copo térmico inox com canudo",
    categoria: "Brindes",
    icone: "🥤",
    descricao: "Copo térmico inox com canudo, ideal para o dia a dia, passeios ou eventos. Mantém sua bebida favorita na temperatura ideal por muito mais tempo.",
    recursos: ["Pedidos acima de 10 unidades - consultar valores", "Personalização opcional com sua arte ou logo", "Acompanha canudo"],
    imagem: "assets/produtos/brindes/copo_termico_corres.jpeg"
  },

  // Seus produtos finais (IDs 40 e 41)
  {
    id: 40,
    preco: 100.00,
    nome: "Tábua de carne (3 modelos disponíveis)",
    categoria: "MDF & Laser",
    icone: "🪵",
    descricao: "Tábua de carne de alta qualidade, disponível em 3 modelos diferentes para escolher. Excelente para o churrasco e uso diário.",
    recursos: [
      "Disponível em 3 modelos diferentes",
      "Personalização opcional conforme projeto",
      "Pedidos acima de 10 un - consultar valores"],
    imagem: "assets/produtos/mdf/tabua_carne_medidas1.jpeg"
  },

  {id:41,
    preco:120.00,
    nome:"Caixas personalizadas (madeira e MDF)",
    categoria:"MDF & Laser",
    icone:"📦",
    descricao:"Caixas em madeira e MDF de alta qualidade, personalizadas com gravação ou corte a laser, perfeitas para presentes corporativos, lembranças ou organização com elegância.",
    recursos:[
      "Fabricadas em madeira ou MDF de excelente acabamento",
      "Personalização opcional a laser com nomes, logos ou projetos",
      "Para pedidos acima de 10 un - consultar valores"
    ],
    imagem:"assets/produtos/mdf/caixa_personalizada.jpg"}

   

];