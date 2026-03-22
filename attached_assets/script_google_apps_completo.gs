// ============================================================
// ⚙️ CONFIGURAÇÃO — EDITE APENAS ESTA SEÇÃO
// ============================================================

// 📧 E-mail de destino por fornecedor
// A chave deve ser o nome EXATO do fornecedor (como está na planilha LIST)
const EMAILS_FORNECEDOR = {
  "HIGHSTAR":                   "cancelamentos@highstar.com",
  "CVC":                        "cancelamentos@cvc.com.br",
  "LOCALIZA":                   "suporte@localiza.com.br",
  "DECOLAR":                    "b2b@decolar.com",
  "HOTEIS.COM":                 "parceiros@hoteis.com",
  // ➕ Adicione mais fornecedores aqui no mesmo formato
  // "NOME_FORNECEDOR":         "email@fornecedor.com",
};

// 📧 E-mail padrão usado quando o fornecedor não está na lista acima
const EMAIL_PADRAO = "cancelamentos@suaempresa.com.br";

// 📋 Cópias fixas — esses endereços recebem TODOS os cancelamentos
const EMAILS_CC = [
  "marcos@suaempresa.com.br",
  "operacoes@suaempresa.com.br",
  // ➕ Adicione mais e-mails de cópia aqui
];

// ============================================================
// 🚀 NÃO EDITE ABAIXO DESTA LINHA (CÓDIGO DO SISTEMA)
// ============================================================


// ─────────────────────────────────────────────────────────────
// RECEBE DADOS DO SISTEMA (Controle da Operação)
// ─────────────────────────────────────────────────────────────
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    // Formata data se vier preenchida
    let dataFormatada = data.dataUso || "";
    if (dataFormatada && dataFormatada.length > 5) {
      try {
        dataFormatada = Utilities.formatDate(
          new Date(dataFormatada),
          Session.getScriptTimeZone(),
          "dd/MM/yyyy"
        );
      } catch (_) {
        // mantém o valor original se não conseguir formatar
      }
    }

    // Busca anexos do Drive (quando informados)
    let anexos = [];
    if (data.idsAnexo && data.idsAnexo.length > 0) {
      data.idsAnexo.forEach(linkOuId => {
        try {
          let id = linkOuId.match(/[-\w]{25,}/);
          id = id ? id[0] : linkOuId;
          let arquivo = DriveApp.getFileById(id);
          anexos.push(arquivo.getAs(MimeType.PDF));
        } catch (err) {
          Logger.log("Erro ao buscar anexo: " + err.message);
        }
      });
    }

    // Monta payload completo
    const payload = {
      numeroPedido:       data.numeroPedido       || "",
      fornecedor:         data.fornecedor         || "",
      atracao:            data.atracao            || "",
      booking:            data.booking            || "",
      valor:              data.valor              || "",
      dataUso:            dataFormatada,
      nomePax:            data.nomePax            || "",
      motivoCancelamento: data.motivoCancelamento || "",
      criadoPor:          data.criadoPor          || "",
      assinaturaNome:     data.assinaturaNome     || "Marcos Leonidio",
      assinaturaCargo:    data.assinaturaCargo    || "Supervisor de Emissão",
      anexos:             anexos
    };

    // Envia e-mail e registra no painel
    enviarEmailsMultiplo([payload]);
    registrarNoPainel(payload);

    return ContentService
      .createTextOutput(JSON.stringify({ status: "ok" }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    Logger.log("Erro no doPost: " + err.message);
    return ContentService
      .createTextOutput(JSON.stringify({ status: "erro", msg: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}


// ─────────────────────────────────────────────────────────────
// ENVIO DE E-MAIL COM ROTEAMENTO POR FORNECEDOR + CÓPIAS
// ─────────────────────────────────────────────────────────────
function enviarEmailsMultiplo(payloads) {
  payloads.forEach(p => {

    // 1. Define o e-mail de destino pelo fornecedor
    const fornecedorKey = (p.fornecedor || "").toUpperCase().trim();
    let emailDestino = EMAIL_PADRAO;

    for (const [chave, email] of Object.entries(EMAILS_FORNECEDOR)) {
      if (fornecedorKey.includes(chave.toUpperCase())) {
        emailDestino = email;
        break;
      }
    }

    Logger.log("Enviando para: " + emailDestino + " | Fornecedor: " + p.fornecedor);

    // 2. Monta o corpo do e-mail em HTML
    const assunto = "Solicitação de Cancelamento - Pedido " + p.numeroPedido;

    const corpoHtml = `
      <div style="font-family:'Segoe UI',Arial,sans-serif;background:#f4f4f4;padding:30px;">
        <div style="max-width:600px;margin:auto;background:#ffffff;border-radius:12px;
                    box-shadow:0 4px 16px rgba(0,0,0,0.1);overflow:hidden;border-top:6px solid #c0392b;">

          <!-- Cabeçalho -->
          <div style="background:#c0392b;padding:24px 32px;">
            <h2 style="color:#ffffff;margin:0;font-size:20px;">
              Solicitação de Cancelamento
            </h2>
            <p style="color:#f5c6c6;margin:6px 0 0;font-size:13px;">
              Pedido Nº ${p.numeroPedido} — ${Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd/MM/yyyy")}
            </p>
          </div>

          <!-- Corpo -->
          <div style="padding:28px 32px;">
            <p style="color:#333;margin:0 0 16px;">Olá,</p>
            <p style="color:#333;margin:0 0 20px;">
              Solicito o cancelamento do pedido abaixo. Por favor, confirme o recebimento e retorne com o status assim que possível.
            </p>

            <!-- Tabela de dados -->
            <table style="width:100%;border-collapse:collapse;font-size:14px;">
              <tr style="background:#fdf2f2;">
                <td style="padding:10px 12px;font-weight:600;color:#c0392b;width:45%;border-bottom:1px solid #f0d0d0;">Código do Pedido JT</td>
                <td style="padding:10px 12px;color:#333;border-bottom:1px solid #f0d0d0;">${p.numeroPedido}</td>
              </tr>
              <tr>
                <td style="padding:10px 12px;font-weight:600;color:#c0392b;border-bottom:1px solid #f0d0d0;">Código Booking</td>
                <td style="padding:10px 12px;color:#333;border-bottom:1px solid #f0d0d0;">${p.booking || "—"}</td>
              </tr>
              <tr style="background:#fdf2f2;">
                <td style="padding:10px 12px;font-weight:600;color:#c0392b;border-bottom:1px solid #f0d0d0;">Fornecedor</td>
                <td style="padding:10px 12px;color:#333;border-bottom:1px solid #f0d0d0;">${p.fornecedor || "—"}</td>
              </tr>
              <tr>
                <td style="padding:10px 12px;font-weight:600;color:#c0392b;border-bottom:1px solid #f0d0d0;">Tipo do Ticket / Atração</td>
                <td style="padding:10px 12px;color:#333;border-bottom:1px solid #f0d0d0;">${p.atracao || "—"}</td>
              </tr>
              <tr style="background:#fdf2f2;">
                <td style="padding:10px 12px;font-weight:600;color:#c0392b;border-bottom:1px solid #f0d0d0;">Valor</td>
                <td style="padding:10px 12px;color:#333;border-bottom:1px solid #f0d0d0;">${p.valor ? "R$ " + p.valor : "—"}</td>
              </tr>
              <tr>
                <td style="padding:10px 12px;font-weight:600;color:#c0392b;border-bottom:1px solid #f0d0d0;">Data de Uso</td>
                <td style="padding:10px 12px;color:#333;border-bottom:1px solid #f0d0d0;">${p.dataUso || "—"}</td>
              </tr>
              <tr style="background:#fdf2f2;">
                <td style="padding:10px 12px;font-weight:600;color:#c0392b;border-bottom:1px solid #f0d0d0;">Nome do Passageiro Principal</td>
                <td style="padding:10px 12px;color:#333;border-bottom:1px solid #f0d0d0;">${p.nomePax || "—"}</td>
              </tr>
              <tr>
                <td style="padding:10px 12px;font-weight:600;color:#c0392b;">Motivo do Cancelamento</td>
                <td style="padding:10px 12px;color:#c0392b;font-weight:600;">${p.motivoCancelamento || "—"}</td>
              </tr>
            </table>

            <p style="margin:24px 0 0;color:#555;font-size:13px;">
              Agradeço a atenção e aguardo retorno.
            </p>

            <!-- Assinatura -->
            <div style="margin-top:24px;padding-top:16px;border-top:2px solid #f0d0d0;">
              <p style="margin:0;font-weight:700;color:#c0392b;font-size:14px;">${p.assinaturaNome}</p>
              <p style="margin:4px 0 0;color:#666;font-size:13px;">${p.assinaturaCargo}</p>
              <p style="margin:4px 0 0;color:#666;font-size:13px;">Telefone: 71 99252-9768</p>
            </div>
          </div>

          <!-- Rodapé -->
          <div style="background:#f9f9f9;padding:14px 32px;border-top:1px solid #f0d0d0;">
            <p style="margin:0;color:#aaa;font-size:11px;text-align:center;">
              Este e-mail foi gerado automaticamente pelo sistema Controle da Operação.
            </p>
          </div>
        </div>
      </div>`;

    // 3. Opções de envio
    const opcoes = {
      htmlBody: corpoHtml,
      cc: EMAILS_CC.join(","),
      name: "Controle da Operação"
    };

    // Adiciona anexos se houver
    if (p.anexos && p.anexos.length > 0) {
      opcoes.attachments = p.anexos;
    }

    // 4. Envia o e-mail
    GmailApp.sendEmail(emailDestino, assunto, "", opcoes);
    Logger.log("E-mail enviado com sucesso para: " + emailDestino);
  });
}


// ─────────────────────────────────────────────────────────────
// REGISTRA NO PAINEL DE CANCELAMENTO
// ─────────────────────────────────────────────────────────────
function registrarNoPainel(p) {
  const ss = SpreadsheetApp.openById("1wtFdF0OtgWn7A9uPe1pK5l4rh5cCoBbEuCkdJJubkOM");
  const aba = ss.getSheetByName("PAINEL DE CANCELAMENTO");

  aba.appendRow([
    p.numeroPedido,
    p.fornecedor,
    p.atracao,
    p.booking,
    p.valor,
    p.dataUso,
    p.nomePax,
    p.motivoCancelamento,
    p.criadoPor,
    Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "dd/MM/yyyy"),
    "PENDENTE CANCELAMENTO",
    "",
    "",
    "",
    p.assinaturaNome
  ]);
}


// ─────────────────────────────────────────────────────────────
// BUSCA PEDIDO NA ABA LIST
// ─────────────────────────────────────────────────────────────
function buscarPedidoAPI(numeroPedido) {
  const ss = SpreadsheetApp.openById("1wtFdF0OtgWn7A9uPe1pK5l4rh5cCoBbEuCkdJJubkOM");
  const aba = ss.getSheetByName("LIST");
  const dados = aba.getDataRange().getValues();
  const cab = dados[0];
  const idx = (nome) => cab.indexOf(nome);

  for (let i = 1; i < dados.length; i++) {
    if (String(dados[i][idx("numero_do_pedido")]) === String(numeroPedido)) {
      return {
        numeroPedido: dados[i][idx("numero_do_pedido")],
        fornecedor:   dados[i][idx("fornecedor")],
        atracao:      dados[i][idx("produto")],
        booking:      dados[i][idx("loc_booking")],
        valor:        dados[i][idx("custo_emissao")],
        dataUso:      dados[i][idx("data_inicio")],
        criadoPor:    dados[i][idx("emitido_por")]
      };
    }
  }
  return null;
}


// ─────────────────────────────────────────────────────────────
// BUSCA VOUCHER NO DRIVE PELO BOOKING
// ─────────────────────────────────────────────────────────────
function buscarVoucherPorBooking(booking) {
  const pasta = DriveApp.getFolderById("1cTLb2llw5xzr1NgUvXjDea1IjQ3yOnME");
  const arquivos = pasta.getFilesByName(booking + ".pdf");
  return arquivos.hasNext() ? arquivos.next() : null;
}
