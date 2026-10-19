const SUPABASE_URL =
    "https://wmtbpsgoltyzygouklmd.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_8otoePXjVkfPMZyIzxPI-Q_4hZvdEiA";


let supabaseClient = null;


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
   MOSTRAR TELA CORRETA
   ========================================= */

function atualizarTela(usuarioLogado) {

    const loginTela =
        document.getElementById("loginTela");

    const portalTela =
        document.getElementById("portalTela");


    if (usuarioLogado) {

        loginTela.classList.add("escondido");

        portalTela.classList.remove("escondido");

    } else {

        portalTela.classList.add("escondido");

        loginTela.classList.remove("escondido");
    }
}


/* =========================================
   ENTRAR
   ========================================= */

async function entrar() {

    const email =
        document.getElementById("email").value.trim();

    const senha =
        document.getElementById("senha").value;

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

        atualizarTela(data.session);


    } catch (erroLogin) {

        console.error(erroLogin);

        erro.textContent =
            "ERRO AO CONECTAR. TENTE NOVAMENTE.";
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

        atualizarTela(null);


    } catch (erroLogout) {

        console.error(erroLogout);
    }
}


/* =========================================
   VERIFICAR LOGIN AO ABRIR O SITE
   ========================================= */

async function verificarLogin() {

    try {

        const supabase =
            await supabasePronto;


        const {
            data: { session }
        } =
            await supabase.auth.getSession();


        atualizarTela(session);


        supabase.auth.onAuthStateChange(
            (_evento, novaSessao) => {

                atualizarTela(novaSessao);

            }
        );


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