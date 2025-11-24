import { Link } from 'react-router-dom';

function errorPagina(){
    return(
    <>
        <head>
            <title>Pagina no encontrada</title>
        </head>
        <div>
            <h1>PAGINA NO ENCONTRADA</h1>
            <Link to='/'>Inicio</Link>
        </div>
    </>
    )
}

export default errorPagina;