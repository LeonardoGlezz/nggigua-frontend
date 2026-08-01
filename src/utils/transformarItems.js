// Los items vienen de la API con la forma de la tabla item_actividad
// (contenido en JSONB + respuesta_correcta aparte). Los 5 juegos fueron
// escritos originalmente contra un array plano hardcodeado con esta forma
// {id, palabra, traduccion, emoji, categoria}. Esta función traduce entre
// ambas formas para no tener que reescribir la lógica interna de cada juego.
export function transformarItems(items) {
    return (items || []).map(item => ({
        id: item.id,
        palabra: item.respuesta_correcta,
        traduccion: item.contenido?.traduccion ?? '',
        emoji: item.contenido?.emoji ?? '❓',
        categoria: item.contenido?.categoria ?? null,
    }));
}
