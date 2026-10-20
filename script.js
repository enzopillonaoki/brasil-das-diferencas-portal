const SUPABASE_URL =
    "https://wmtbpsgoltyzygouklmd.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_8otoePXjVkfPMZyIzxPI-Q_4hZvdEiA";

const SITE_URL =
    "https://brasil-das-diferencas-portal.vercel.app/";

let modoCriarSenha = false;


/* =========================================
   CONECTAR AO SUPABASE
   ========================================= */

const supabasePronto = import(
    "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm"
).then(({ createClient }) => {

    return createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );
});


/* =========================================
   TELAS
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


function atualizarTela(sessao) {

    esconderTelas();

    if (modoCriarSenha && sessao) {

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
   LOGIN
   ========================================= */

async function entrar() {

    const email =
        document.getElementById("email").value.trim();

    const senha =
        document.getElementById("senha").value;

    const erro =
        document.getElementById("erro");

    erro.textContent = "";

    if (!email || !senha) {

        erro.textContent =
            "PREENCHA O E-MAIL E A SENHA.";

        return;
    }

    erro.textContent =
        "ENTRANDO...";

    const supabase =
        await supabasePronto;

    const { data, error } =
        await supabase.auth.signInWithPassword({

            email: email,
            password: senha

        });

    if (error) {

        erro.textContent =
            "E-MAIL OU SENHA INCORRETOS.";

        return;
    }

    erro.textContent = "";

    atualizarTela(data.session);
}


/* =========================================
   ENVIAR LINK PARA CRIAR / REDEFINIR SENHA
   ========================================= */

async function enviarLinkSenha() {

    const email =
        document.getElementById("email").value.trim();

    const erro =
        document.getElementById("erro");

    if (!email) {

        erro.textContent =
            "DIGITE SEU E-MAIL PRIMEIRO.";

        return;
    }

    erro.textContent =
        "ENVIANDO LINK...";

    const supabase =
        await supabasePronto;

    const { error } =
        await supabase.auth.resetPasswordForEmail(
            email,
            {
                redirectTo: SITE_URL
            }
        );

    if (error) {

        console.error(error);

        erro.textContent =
            "NÃO FOI POSSÍVEL ENVIAR O LINK.";

        return;
    }

    erro.textContent =
        "LINK ENVIADO! VERIFIQUE SEU E-MAIL.";
}


/* =========================================
   CRIAR NOVA SENHA
   ========================================= */

async function definirSenha() {

    const novaSenha =
        document.getElementById("novaSenha").value;

    const confirmarSenha =
        document.getElementById("confirmarSenha").value;

    const erroSenha =
        document.getElementById("erroSenha");

    erroSenha.textContent = "";

    if (!novaSenha || !confirmarSenha) {

        erroSenha.textContent =
            "PREENCHA OS DOIS CAMPOS.";

        return;
    }

    if (novaSenha.length < 8) {

        erroSenha.textContent =
            "USE PELO MENOS 8 CARACTERES.";

        return;
    }

    if (novaSenha !== confirmarSenha) {

        erroSenha.textContent =
            "AS SENHAS NÃO SÃO IGUAIS.";

        return;
    }

    erroSenha.textContent =
        "SALVANDO SENHA...";

    const supabase =
        await supabasePronto;

    const { error } =
        await supabase.auth.updateUser({

            password: novaSenha

        });

    if (error) {

        console.error(error);

        erroSenha.textContent =
            "ERRO AO CRIAR A SENHA.";

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
    } = await supabase.auth.getSession();

    atualizarTela(session);
}


/* =========================================
   SAIR
   ========================================= */

async function sair() {

    const supabase =
        await supabasePronto;

    await supabase.auth.signOut();

    modoCriarSenha = false;

    atualizarTela(null);
}


/* =========================================
   INICIAR
   ========================================= */

async function iniciar() {

    const supabase =
        await supabasePronto;


    supabase.auth.onAuthStateChange(
        (evento, sessao) => {

            if (
                evento === "PASSWORD_RECOVERY"
            ) {

                modoCriarSenha = true;

                atualizarTela(sessao);

                return;
            }

            atualizarTela(sessao);
        }
    );


    const {
        data: { session }
    } = await supabase.auth.getSession();

    atualizarTela(session);
}


iniciar();