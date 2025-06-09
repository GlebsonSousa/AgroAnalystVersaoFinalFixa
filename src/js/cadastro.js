document.addEventListener('DOMContentLoaded', () => {

    const voltar = document.getElementById('voltar');
    const voltarForm = document.getElementById('voltar-form');
    const mudaParaCadastro2 = document.getElementById('btn-continuar');
    const confirmarForm = document.getElementById('form-confirmacao');

    const cadastro1 = document.querySelector('.cadastro1');
    const cadastro2 = document.querySelector('.cadastro2');
    const formulario = document.getElementById("form");

    const campoNome = document.getElementById("txt_nome_usuario");
    const campoEmail = document.getElementById("txt_email_usuario");
    const campoData = document.getElementById("dte_nasc_usuario");
    const campoCPF = document.getElementById("num_cpf_usuario");
    const campoTelefone = document.getElementById("num_tell_usuario");

    function validaEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    function validarCPF(cpf) {
        cpf = cpf.replace(/[^\d]+/g, '');
        if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

        let soma = 0;
        for (let i = 0; i < 9; i++) {
            soma += parseInt(cpf.charAt(i)) * (10 - i);
        }

        let resto = 11 - (soma % 11);
        let digito1 = (resto >= 10) ? 0 : resto;

        if (digito1 !== parseInt(cpf.charAt(9))) return false;

        soma = 0;
        for (let i = 0; i < 10; i++) {
            soma += parseInt(cpf.charAt(i)) * (11 - i);
        }

        resto = 11 - (soma % 11);
        let digito2 = (resto >= 10) ? 0 : resto;

        return digito2 === parseInt(cpf.charAt(10));
    }

    function validaDataNascimento(dataString) {
        if (!dataString) return false;

        const dataNasc = new Date(dataString);
        const hoje = new Date();

        if (isNaN(dataNasc)) return false;

        let idade = hoje.getFullYear() - dataNasc.getFullYear();
        const mes = hoje.getMonth() - dataNasc.getMonth();
        const dia = hoje.getDate() - dataNasc.getDate();

        if (mes < 0 || (mes === 0 && dia < 0)) idade--;

        return idade >= 18 && idade <= 120;
    }

    voltar.addEventListener('click', () => {
        location.href = "/index.html";
    });

    voltarForm.addEventListener('click', () => {
        cadastro1.style.display = 'flex';
        cadastro2.style.display = 'none';
        formulario.style.height = "80vh";
    });

    mudaParaCadastro2.addEventListener('click', () => {
        const nomeValido = campoNome.value.trim().length > 4;
        const emailValido = validaEmail(campoEmail.value.trim());
        const dataValida = validaDataNascimento(campoData.value.trim());
        const cpfValido = validarCPF(campoCPF.value.trim());

        if (nomeValido && emailValido && dataValida && cpfValido) {
            cadastro1.style.display = 'none';
            cadastro2.style.display = 'flex';
            formulario.style.height = "65vh";
        } else {
            let mensagem = "Corrija os seguintes erros:\n";
            if (!nomeValido) mensagem += "- Nome deve ter mais que 4 caracteres.\n";
            if (!emailValido) mensagem += "- Email inválido.\n";
            if (!dataValida) mensagem += "- Data de nascimento inválida (mín. 18 anos).\n";
            if (!cpfValido) mensagem += "- CPF inválido.\n";
            alert(mensagem);
        }
    });

    confirmarForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const senha = document.getElementById('txt_senha_usuario');
        const confirmaSenha = document.getElementById('txt_senha_confirma');
        const emailRecuperacao = document.getElementById('txt_confirma_email');

        let mensagem = "Corrija os seguintes erros:\n";
        let valido = true;

        if (!senha.value || senha.value.length < 8) {
            mensagem += "- Senha deve ter no mínimo 8 caracteres.\n";
            valido = false;
        }

        if (confirmaSenha.value !== senha.value) {
            mensagem += "- A confirmação da senha não coincide.\n";
            valido = false;
        }

        if (!validaEmail(emailRecuperacao.value)) {
            mensagem += "- E-mail de recuperação inválido.\n";
            valido = false;
        }

        if (valido) {
            const dadosUsuario = {
                nome: campoNome.value.trim(),
                email: campoEmail.value.trim(),
                nascimento: campoData.value.trim(),
                cpf: campoCPF.value.trim(),
                telefone: campoTelefone.value.trim(),
                senha: senha.value.trim(),
                emailRecuperacao: emailRecuperacao.value.trim()
            };

            localStorage.setItem('usuario', JSON.stringify(dadosUsuario));
            alert("Cadastro finalizado com sucesso!");
            location.href = "/index.html";
        } else {
            alert(mensagem);
        }
    });

});
