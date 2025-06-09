document.addEventListener('DOMContentLoaded', () => {
    //Define variaveis para objetos do html

    const logo = document.getElementById('area-logo')
    const cadastrar = document.getElementById('cadastro')
    const logar = document.getElementById('login')
  

    logo.addEventListener('click', () => {
        console.log('Clique captado!')
        location.href = "/index.html"
    })

    cadastrar.addEventListener('click', () => {
        location.href = "/src/paginas/form/formulario.html"
        console.log('chamou')
    })

    login.addEventListener('click', () => {
        location.href = "/src/paginas/form/login.html"
        console.log('chamou')
    })
})