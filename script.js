const SUPABASE_URL =
    "https://wmtbpsgoltyzygouklmd.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_8otoePXjVkfPMZyIzxPI-Q_4hZvdEiA";


let supabaseClient = null;


/* =========================================
   VERIFICAR SE VEIO DE UM CONVITE
   ========================================= */

const parametrosHash =
    new URLSearchParams(
        window.location.hash.substring(1)
    );

const parametrosURL =
    new URLSearchParams(
        window.location.search
    );

const tipoLink =
    parametrosHash.get("type") ||
    parametrosURL.get("type");

let modoCriarSenha =
    tipoLink === "invite";


/* =========================================
   CONECTAR AO SUPABASE
   ========================================= */

const supabasePronto = import(
    "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm"
).then(({ createClient }) => {

    supabaseClient = createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );

    return supabaseClient;
});


/* =========================================
   ESCONDER TODAS AS TELAS
   ========================================= */

function esconderTelas() {

    document
        .getElementById("loginTela")
        .classList.add("escondido");

    document
        .getElementById("senhaTela")
        .classList.add("escondido");

    document
        .getElementById("portalTela")
        .classList.add("escondido");
}


/* =========================================
   ATUALIZAR TELA
   ========================================= */

function atualizarTela(sessao) {

    esconderTelas();


    if (sessao && modoCriarSenha) {

        document
            .getElementById("senhaTela")
            .classList.remove("escondido");

        return;
    }


    if (sessao) {

        document
            .getElementById("portalTela")
            .classList.remove("escondido");

        return;
    }


    document
        .getElementById("loginTela")
        .classList.remove("escondido");
}


/* =========================================
   ENTRAR
   ========================================= */

async function entrar() {

    const email =
        document
            .getElementById("email")
            .value
            .trim();

    const senha =
        document
            .getElementById("senha")
            .value;

    const erro =
        document.getElementById("erro");


    erro.textContent = "";


    if (email === "" || senha === "") {

        erro.textContent =
            "PREENCHA O E-MAIL E A SENHA.";

        return;
    }


    erro.textContent =
        "ENTRANDO...";


    try {

        const supabase =
            await supabasePronto;


        const { data, error } =
            await supabase.auth.signInWithPassword({

                email: email,

                password: senha

            });


        if (error) {

            console.error(error);

            erro.textContent =
                "E-MAIL OU SENHA INCORRETOS.";

            return;
        }


        erro.textContent = "";

        modoCriarSenha = false;

        atualizarTela(data.session);


    } catch (erroLogin) {

        console.error(erroLogin);

        erro.textContent =
            "ERRO AO CONECTAR. TENTE NOVAMENTE.";
    }
}


/* =========================================
   DEFINIR SENHA DO CONVITE
   ========================================= */

async function definirSenha() {

    const novaSenha =
        document
            .getElementById("novaSenha")
            .value;

    const confirmarSenha =
        document
            .getElementById("confirmarSenha")
            .value;

    const erroSenha =
        document.getElementById("erroSenha");


    erroSenha.textContent = "";


    if (
        novaSenha === "" ||
        confirmarSenha === ""
    ) {

        erroSenha.textContent =
            "PREENCHA OS DOIS CAMPOS.";

        return;
    }


    if (novaSenha.length < 8) {

        erroSenha.textContent =
            "A SENHA PRECISA TER PELO MENOS 8 CARACTERES.";

        return;
    }


    if (novaSenha !== confirmarSenha) {

        erroSenha.textContent =
            "AS SENHAS NÃO SÃO IGUAIS.";

        return;
    }


    erroSenha.textContent =
        "CRIANDO SENHA...";


    try {

        const supabase =
            await supabasePronto;


        const { error } =
            await supabase.auth.updateUser({

                password: novaSenha

            });


        if (error) {

            console.error(error);

            erroSenha.textContent =
                "NÃO FOI POSSÍVEL CRIAR A SENHA.";

            return;
        }


        modoCriarSenha = false;


        history.replaceState(
            {},
            document.title,
            window.location.pathname
        );


        const {
            data: { session }
        } =
            await supabase.auth.getSession();


        atualizarTela(session);


    } catch (erro) {

        console.error(erro);

        erroSenha.textContent =
            "ERRO AO CRIAR A SENHA.";
    }
}


/* =========================================
   SAIR
   ========================================= */

async function sair() {

    try {

        const supabase =
            await supabasePronto;


        await supabase.auth.signOut({
            scope: "local"
        });


        document.getElementById("senha").value = "";

        modoCriarSenha = false;

        atualizarTela(null);


    } catch (erroLogout) {

        console.error(erroLogout);
    }
}


/* =========================================
   VERIFICAR LOGIN AO ABRIR
   ========================================= */

async function verificarLogin() {

    try {

        const supabase =
            await supabasePronto;


        supabase.auth.onAuthStateChange(
            (evento, novaSessao) => {

                if (
                    evento === "SIGNED_IN" &&
                    tipoLink === "invite"
                ) {

                    modoCriarSenha = true;
                }


                atualizarTela(
                    novaSessao
                );
            }
        );


        const {
            data: { session }
        } =
            await supabase.auth.getSession();


        atualizarTela(session);


    } catch (erro) {

        console.error(
            "Erro ao iniciar Supabase:",
            erro
        );

        atualizarTela(null);
    }
}


/* =========================================
   INICIAR
   ========================================= */

verificarLogin();