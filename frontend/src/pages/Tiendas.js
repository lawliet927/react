import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'datatables.net-bs5/css/dataTables.bootstrap5.min.css';
import 'datatables.net-dt/css/dataTables.dataTables.min.css';
import 'datatables.net-buttons-bs5/css/buttons.bootstrap5.min.css'; // Asegúrate de que esta línea esté presente
import $ from 'jquery'; // Importar jQuery
import 'datatables.net'; // Importar DataTables
import 'datatables.net-bs5'; // Estilo de DataTables con Bootstrap 5
import 'datatables.net-buttons'; // Importar los botones de DataTables (Excel, PDF, CSV, etc.)

function Tiendas() {
    const [tiendas, setTiendas] = useState([]);
    const [edificaciones, setEdificaciones] = useState([]);
    const [nombre, setNombre] = useState('');
    const [edificacion, setEdificacion] = useState('');
    const [rubro, setRubro] = useState('');
    const [editando, setEditando] = useState(false);
    const [idEdit, setIdEdit] = useState(null);

    const tableRef = useRef(null); // Usamos el useRef para referenciar la tabla

    useEffect(() => {
        obtenerTiendas();
        obtenerEdificaciones();
    }, []);

    // Inicialización de DataTable (con los botones de exportación)
    useEffect(() => {
        if (tiendas.length > 0 && tableRef.current) {
            // Destruir la instancia anterior de DataTable si existe
            if ($.fn.dataTable.isDataTable(tableRef.current)) {
                $(tableRef.current).DataTable().destroy();
            }
            
            // Inicializar DataTable con los botones
            $(tableRef.current).DataTable({
                dom: 'Bfrtip', // Habilita los botones de exportación
                buttons: [
                    'excel', 
                    'pdf', 
                    'csv', 
                    'copy'
                ], // Botones de exportación
                searching: true, // Activar el buscador
                paging: true,
                ordering: true,
                info: true
            });
        }
    }, [tiendas]); // Ejecutar cuando se actualizan los datos de tiendas

    const obtenerTiendas = async () => {
        try {
            console.log("📥 Obteniendo tiendas...");
            const response = await axios.get('http://localhost:5000/api/tiendas');
            setTiendas(response.data);
            console.log("✅ Tiendas obtenidas:", response.data);
        } catch (error) {
            console.error("❌ Error al obtener tiendas:", error);
            toast.error("❌ Error al obtener tiendas");
        }
    };

    const obtenerEdificaciones = async () => {
        try {
            console.log("📥 Obteniendo edificaciones...");
            const response = await axios.get('http://localhost:5000/api/edificaciones');
            setEdificaciones(response.data);
            console.log("✅ Edificaciones obtenidas:", response.data);
        } catch (error) {
            console.error("❌ Error al obtener edificaciones:", error);
            toast.error("❌ Error al obtener edificaciones");
        }
    };

    const agregarTienda = async (e) => {
        e.preventDefault();
        try {
            if (editando) {
                console.log(`✏️ Actualizando tienda ${idEdit}`);
                await axios.put(`http://localhost:5000/api/tiendas/${idEdit}`, { nombre, edificacion, rubro });
                toast.success("✅ Tienda actualizada con éxito");
                setEditando(false);
                setIdEdit(null);
            } else {
                console.log("➕ Agregando nueva tienda...");
                await axios.post('http://localhost:5000/api/tiendas', { nombre, edificacion, rubro });
                toast.success("✅ Tienda agregada con éxito");
            }
            limpiarFormulario();
            await obtenerTiendas();
        } catch (error) {
            console.error("❌ Error al guardar tienda:", error);
            toast.error("❌ Error al guardar la tienda");
        }
    };

    const eliminarTienda = async (id) => {
        if (!window.confirm("¿Estás seguro de eliminar esta tienda?")) return;
        try {
            console.log(`🗑️ Eliminando tienda ${id}`);
            await axios.delete(`http://localhost:5000/api/tiendas/${id}`);
            toast.success("🗑️ Tienda eliminada con éxito");
            await obtenerTiendas();
        } catch (error) {
            console.error("❌ Error al eliminar tienda:", error);
            toast.error("❌ Error al eliminar la tienda");
        }
    };

    const editarTienda = (tienda) => {
        console.log(`✏️ Editando tienda:`, tienda);
        setNombre(tienda.nombre);
        setEdificacion(tienda.edificacion._id);
        setRubro(tienda.rubro);
        setEditando(true);
        setIdEdit(tienda._id);
    };

    const limpiarFormulario = () => {
        setNombre('');
        setEdificacion('');
        setRubro('');
        setEditando(false);
        setIdEdit(null);
    };

    return (
        <>
            {/* 🔥 Contenedor de Notificaciones */}
            <ToastContainer position="top-right" autoClose={3000} />

            <div className="container mt-4">
                <h2>Gestión de Tiendas</h2>

                <form onSubmit={agregarTienda} className="mb-4">
                    <div className="row">
                        <div className="col-md-4">
                            <input type="text" className="form-control" placeholder="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
                        </div>
                        <div className="col-md-4">
                            <select className="form-control" value={edificacion} onChange={(e) => setEdificacion(e.target.value)} required>
                                <option value="">Seleccione una Edificación</option>
                                {edificaciones.map((edif) => (
                                    <option key={edif._id} value={edif._id}>{edif.nombre}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-3">
                            <input type="text" className="form-control" placeholder="Rubro" value={rubro} onChange={(e) => setRubro(e.target.value)} required />
                        </div>
                        <div className="col-md-1">
                            <button type="submit" className={`btn ${editando ? 'btn-warning' : 'btn-primary'}`}>
                                {editando ? 'Actualizar' : 'Agregar'}
                            </button>
                        </div>
                    </div>
                </form>

                {/* Table */}
                <table ref={tableRef} className="table table-striped">
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Edificación</th>
                            <th>Rubro</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tiendas.map((tienda) => (
                            <tr key={tienda._id}>
                                <td>{tienda.nombre}</td>
                                <td>{tienda.edificacion ? tienda.edificacion.nombre : 'N/A'}</td>
                                <td>{tienda.rubro}</td>
                                <td>
                                    <button className="btn btn-info btn-sm me-2" onClick={() => editarTienda(tienda)}>Editar</button>
                                    <button className="btn btn-danger btn-sm" onClick={() => eliminarTienda(tienda._id)}>Eliminar</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
}

export default Tiendas;
