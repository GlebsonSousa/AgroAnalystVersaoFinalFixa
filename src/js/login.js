document.addEventListener('DOMContentLoaded', () => {
    const entrar = document.getElementById('btn-entrar');
    const voltar = document.getElementById('voltar');

    if (entrar) {
        entrar.addEventListener('click', (e) => {
            e.preventDefault(); // evita envio padrão do form

            const emailDigitado = document.getElementById('txt_email_usuario').value.trim();
            const senhaDigitada = document.getElementById('senha').value.trim();

            const dadosSalvos = localStorage.getItem('usuario');

            if (!dadosSalvos) {
                alert("Nenhum usuário cadastrado.");
                return;
            }

            const usuario = JSON.parse(dadosSalvos);

            if (
                emailDigitado === usuario.email &&
                senhaDigitada === usuario.senha
            ) {
                alert("Login realizado com sucesso!");
                location.href = "/index.html";
            } else {
                alert("Email ou senha incorretos.");
            }
        });
    }

    if (voltar) {
        voltar.addEventListener('click', () => {
            location.href = "/index.html";
        });
    }
});
