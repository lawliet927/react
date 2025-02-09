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

function FechasEntrega() {
    const [fechasEntrega, setFechasEntrega] = useState([]);
    const [tiendas, setTiendas] = useState([]);
    const [tienda, setTienda] = useState('');
    const [fecha, setFecha] = useState('');
    const [editando, setEditando] = useState(false);
    const [idEdit, setIdEdit] = useState(null);

    const tableRef = useRef(null); // Usamos el useRef para referenciar la tabla

    // Cargar las fechas de entrega y las tiendas
    useEffect(() => {
        obtenerFechasEntrega();
        obtenerTiendas();
    }, []);

    // Inicialización de DataTable
    useEffect(() => {
        if (fechasEntrega.length > 0 && tableRef.current) {
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
    }, [fechasEntrega]); // Ejecutar cuando se actualizan los datos de fechasEntrega

    const obtenerFechasEntrega = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/fechasEntrega');
            setFechasEntrega(response.data);
        } catch (error) {
            toast.error('❌ Error al obtener las fechas de entrega');
        }
    };

    const obtenerTiendas = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/tiendas');
            setTiendas(response.data);
        } catch (error) {
            toast.error('❌ Error al obtener las tiendas');
        }
    };

    const agregarFechaEntrega = async (e) => {
        e.preventDefault();
        try {
            if (editando) {
                await axios.put(`http://localhost:5000/api/fechasEntrega/${idEdit}`, { tienda, fecha });
                toast.success('✅ Fecha de entrega actualizada con éxito');
                setEditando(false);
                setIdEdit(null);
            } else {
                await axios.post('http://localhost:5000/api/fechasEntrega', { tienda, fecha });
                toast.success('✅ Fecha de entrega agregada con éxito');
            }
            limpiarFormulario();
            obtenerFechasEntrega();
        } catch (error) {
            toast.error('❌ Error al guardar la fecha de entrega');
        }
    };

    const eliminarFechaEntrega = async (id) => {
        if (!window.confirm('¿Estás seguro de eliminar esta fecha de entrega?')) return;
        try {
            await axios.delete(`http://localhost:5000/api/fechasEntrega/${id}`);
            toast.success('🗑️ Fecha de entrega eliminada con éxito');
            obtenerFechasEntrega();
        } catch (error) {
            toast.error('❌ Error al eliminar la fecha de entrega');
        }
    };

    const editarFechaEntrega = (f) => {
        setTienda(f.tienda._id);
        setFecha(f.fecha.split('T')[0]); // Formatear fecha para el input
        setEditando(true);
        setIdEdit(f._id);
    };

    const limpiarFormulario = () => {
        setTienda('');
        setFecha('');
        setEditando(false);
        setIdEdit(null);
    };

    return (
        <div className="container mt-4">
            <h2>Gestión de Fechas de Entrega</h2>

            {/* 🔥 Contenedor de Notificaciones */}
            <ToastContainer position="top-right" autoClose={3000} /> {/* ✔ Corregido */}

            <form onSubmit={agregarFechaEntrega} className="mb-4">
                <div className="row">
                    <div className="col-md-5">
                        <select className="form-control" value={tienda} onChange={(e) => setTienda(e.target.value)} required>
                            <option value="">Seleccione una Tienda</option>
                            {tiendas.map((tienda) => (
                                <option key={tienda._id} value={tienda._id}>{tienda.nombre}</option>
                            ))}
                        </select>
                    </div>
                    <div className="col-md-5">
                        <input type="date" className="form-control" value={fecha} onChange={(e) => setFecha(e.target.value)} required />
                    </div>
                    <div className="col-md-2">
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
                        <th>Tienda</th>
                        <th>Fecha de Entrega</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {fechasEntrega.map((f) => (
                        <tr key={f._id}>
                            <td>{f.tienda ? f.tienda.nombre : 'N/A'}</td>
                            <td>{new Date(f.fecha).toLocaleDateString()}</td>
                            <td>
                                <button className="btn btn-info btn-sm me-2" onClick={() => editarFechaEntrega(f)}>Editar</button>
                                <button className="btn btn-danger btn-sm" onClick={() => eliminarFechaEntrega(f._id)}>Eliminar</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default FechasEntrega;
