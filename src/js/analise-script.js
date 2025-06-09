document.addEventListener('DOMContentLoaded', () => {
  const ctxChuva = document.getElementById('grafico-chuva')?.getContext('2d');
  const logo = document.getElementById('area-logo');
  const cadastrar = document.getElementById('cadastro');
  const login = document.getElementById('login');
  const botao = document.getElementById("botao-analisar-solo");

  if (!ctxChuva) return;

  setupEventListeners();
  inicializarGrafico(ctxChuva);
  carregarDadosIniciais('Sorocaba');
  
  // ----------------------------------------
  // Funções

  function setupEventListeners() {
    if (cadastrar) {
      cadastrar.addEventListener('click', () => {
        location.href = "/src/paginas/form/formulario.html";
        console.log('Cadastro clicado');
      });
    }

    if (login) {
      login.addEventListener('click', () => {
        location.href = "/src/paginas/form/login.html";
        console.log('Login clicado');
      });
    }

    if (logo) {
      logo.addEventListener('click', () => {
        location.href = "/index.html";
      });
    }

    if (botao) {
      botao.addEventListener("click", buscarPorCep);
    }
  }

  // Variáveis globais para spinner
  let spinnerAngle = 0;
  let spinnerAnimationFrameId = null;

  function inicializarGrafico(ctx) {
    window.graficoChuva = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: [],
        datasets: [{
          label: 'Chuva total (mm)',
          data: [],
          backgroundColor: '#2f6c2f',
          borderRadius: 10,
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: true,
            position: 'bottom',
            labels: { color: '#333', font: { size: 14 } }
          },
          tooltip: {
            callbacks: {
              label: ctx => `${ctx.parsed.y} mm`
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: { display: true, text: 'Milímetros (mm)', color: '#333', font: { size: 14 } },
            ticks: { color: '#333' }
          },
          x: { ticks: { color: '#333' } }
        }
      }
    });
  }

  function desenharSpinner() {
    const canvas = ctxChuva.canvas;
    const ctx = ctxChuva;
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = 20;
    const lineWidth = 5;
    const numLines = 12;

    ctx.clearRect(0, 0, width, height);

    ctx.save();
    ctx.translate(centerX, centerY);

    for (let i = 0; i < numLines; i++) {
      const angle = ((2 * Math.PI) / numLines) * i;
      const alpha = (i + spinnerAngle) % numLines / numLines;

      ctx.beginPath();
      ctx.rotate(angle);
      ctx.moveTo(radius, 0);
      ctx.lineTo(radius + 10, 0);
      ctx.lineWidth = lineWidth;
      ctx.strokeStyle = `rgba(47, 108, 47, ${alpha.toFixed(2)})`;
      ctx.stroke();
      ctx.rotate(-angle);
    }

    ctx.restore();

    spinnerAngle += 0.15;
    if (spinnerAngle >= numLines) spinnerAngle = 0;

    spinnerAnimationFrameId = requestAnimationFrame(desenharSpinner);
  }

  function iniciarSpinner() {
    if (!spinnerAnimationFrameId) {
      desenharSpinner();
    }
  }

  function pararSpinner() {
    if (spinnerAnimationFrameId) {
      cancelAnimationFrame(spinnerAnimationFrameId);
      spinnerAnimationFrameId = null;
    }
  }

  async function mostrarMiniMapa(nomeCidade, estado) {
  const query = encodeURIComponent(`${nomeCidade}, ${estado}, Brasil`);
  const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`;

  try {
    const response = await fetch(url, { headers: { 'User-Agent': 'SeuAppNomeAqui' } });
    const data = await response.json();

    if (data.length === 0) {
      console.warn("Cidade não encontrada no geocoding.");
      return;
    }

    const { lat, lon } = data[0];

    if (!window.miniMapa) {
      window.miniMapa = L.map('mini-mapa').setView([lat, lon], 12);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(window.miniMapa);

      window.markerMiniMapa = L.marker([lat, lon]).addTo(window.miniMapa)
        .bindPopup(`${nomeCidade}, ${estado}`).openPopup();

      // Quando o mapa estiver pronto, esconde a imagem e mostra o mapa
      window.miniMapa.whenReady(() => {
        document.getElementById('mapa-imagem').style.display = 'none';
        document.getElementById('mini-mapa').style.display = 'block';
        window.miniMapa.invalidateSize();
      });
    } else {
      window.miniMapa.setView([lat, lon], 12);
      window.markerMiniMapa.setLatLng([lat, lon])
        .setPopupContent(`${nomeCidade}, ${estado}`).openPopup();
    }
  } catch (error) {
    console.error("Erro ao carregar mapa:", error);
  }
}


  function atualizarDadosSolo(solo) {
    if (!solo) return;

    // Atualiza as infos principais
    document.getElementById('cidade').textContent = solo.nome || 'N/D';
    document.getElementById('regiao').textContent = solo.regiao || 'N/D';
    document.getElementById('clima').textContent = solo.clima || 'N/D';
    document.getElementById('tipo-solo').textContent = solo.tipo_solo || 'N/D';

    // Atualiza as características do solo
    if (solo.caracteristicas_solo) {
      document.getElementById('textura').textContent = solo.caracteristicas_solo.textura || 'N/D';
      document.getElementById('drenagem').textContent = solo.caracteristicas_solo.drenagem || 'N/D';
      document.getElementById('ph').textContent = solo.caracteristicas_solo.pH !== undefined ? solo.caracteristicas_solo.pH : 'N/D';
      document.getElementById('fertilidade').textContent = solo.caracteristicas_solo.fertilidade || 'N/D';
    }
  }

  async function buscarPorCep() {
    const cepInput = document.getElementById("input-cidade").value.trim();
    const estadoSpan = document.getElementById("estado");
    const cidadeSpan = document.getElementById("cidade");
    const regiaoSpan = document.getElementById("regiao");

    if (!validarCep(cepInput)) {
      alert("Digite um CEP válido no formato 00000-000 ou 00000000.");
      return;
    }

    try {
      const dadosCep = await buscarDadosCep(cepInput.replace("-", ""));
      if (dadosCep.erro) {
        alert("CEP não encontrado.");
        return;
      }

      const nomeEstado = obterEstadoPorExtenso(dadosCep.uf);
      const regiao = obterRegiaoPorSigla(dadosCep.uf);

      mostrarMiniMapa(dadosCep.localidade, nomeEstado);


      estadoSpan.textContent = nomeEstado;
      cidadeSpan.textContent = dadosCep.localidade;
      regiaoSpan.textContent = regiao;

      console.log(`Cidade: ${dadosCep.localidade}, Estado: ${nomeEstado}, Código IBGE: ${dadosCep.ibge}`);

      await buscarDadosChuvaPorIbge(dadosCep.ibge);

    } catch (erro) {
      alert("Erro ao buscar dados. Tente novamente.");
      console.error(erro);
    }
  }

  function validarCep(cep) {
    return /^\d{5}-?\d{3}$/.test(cep);
  }

  async function buscarDadosCep(cepLimpo) {
    const resposta = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
    return resposta.json();
  }

  async function buscarDadosChuvaPorIbge(codigoIbge) {
    if (!codigoIbge) return alert("Código IBGE inválido.");

    iniciarSpinner();

    try {
      const chuvaResp = await fetch(`https://meteoserver-h0u8.onrender.com/chuva?codigo_ibge=${codigoIbge}`);
      const chuvaDados = await chuvaResp.json();

      if (chuvaDados.erro) {
        alert("Dados de chuva não encontrados para esta cidade.");
        pararSpinner();
        return;
      }

      console.log("🌱 Dados de solo:", chuvaDados.solo); 

      atualizarDadosSolo(chuvaDados.solo);


      atualizarGrafico(chuvaDados);
    } catch (erro) {
      alert("Erro ao buscar dados. Tente novamente.");
      console.error(erro);
    } finally {
      pararSpinner();
    }
  }

  function atualizarGrafico(chuvaDados) {
    const somas = chuvaDados.soma_chuva_mensal;

    if (!somas || !Array.isArray(somas) || somas.length === 0) {
      alert("Dados de chuva incompletos ou inválidos.");
      return;
    }

    // Ordena cronologicamente
    somas.sort((a, b) => a.ano_mes.localeCompare(b.ano_mes));

    const labels = somas.map(m => `${m.nome_mes} ${m.ano_mes.slice(0, 4)}`);
    const dadosChuva = somas.map(m => Number(m.soma_mm) || 0);

    if (window.graficoChuva) {
      window.graficoChuva.data.labels = labels;
      window.graficoChuva.data.datasets[0].label = "Chuva total (mm)";
      window.graficoChuva.data.datasets[0].data = dadosChuva;
      window.graficoChuva.update();
    }
  }

  async function carregarDadosIniciais(nomeCidade) {
    try {
      // Exemplo: Sorocaba não tem CEP fixo, então usar um CEP padrão dela
      // CEP Sorocaba: 18035-000
      const cepSorocaba = '18035000';
      const dadosCep = await buscarDadosCep(cepSorocaba);

      if (dadosCep.erro) {
        console.warn("CEP inicial de Sorocaba não encontrado");
        return;
      }

      const estadoSpan = document.getElementById("estado");
      const cidadeSpan = document.getElementById("cidade");
      const regiaoSpan = document.getElementById("regiao");

      estadoSpan.textContent = obterEstadoPorExtenso(dadosCep.uf);
      cidadeSpan.textContent = dadosCep.localidade;
      regiaoSpan.textContent = obterRegiaoPorSigla(dadosCep.uf);

      await buscarDadosChuvaPorIbge(dadosCep.ibge);
    } catch (erro) {
      console.error("Erro ao carregar dados iniciais:", erro);
    }
  }

  function obterEstadoPorExtenso(uf) {
    const estados = {
      AC: "Acre", AL: "Alagoas", AP: "Amapá", AM: "Amazonas",
      BA: "Bahia", CE: "Ceará", DF: "Distrito Federal", ES: "Espírito Santo",
      GO: "Goiás", MA: "Maranhão", MT: "Mato Grosso", MS: "Mato Grosso do Sul",
      MG: "Minas Gerais", PA: "Pará", PB: "Paraíba", PR: "Paraná",
      PE: "Pernambuco", PI: "Piauí", RJ: "Rio de Janeiro", RN: "Rio Grande do Norte",
      RS: "Rio Grande do Sul", RO: "Rondônia", RR: "Roraima", SC: "Santa Catarina",
      SP: "São Paulo", SE: "Sergipe", TO: "Tocantins"
    };
    return estados[uf] || "Estado desconhecido";
  }

  function obterRegiaoPorSigla(uf) {
    const regioes = {
      Norte: ["AC", "AP", "AM", "PA", "RO", "RR", "TO"],
      Nordeste: ["AL", "BA", "CE", "MA", "PB", "PE", "PI", "RN", "SE"],
      CentroOeste: ["DF", "GO", "MT", "MS"],
      Sudeste: ["ES", "MG", "RJ", "SP"],
      Sul: ["PR", "RS", "SC"]
    };

    for (const [regiao, siglas] of Object.entries(regioes)) {
      if (siglas.includes(uf)) return regiao;
    }
    return "Região desconhecida";
  }
});
