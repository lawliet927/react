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

function Edificaciones() {
    const [edificaciones, setEdificaciones] = useState([]);
    const [nombre, setNombre] = useState('');
    const [direccion, setDireccion] = useState('');
    const [tipo, setTipo] = useState('');
    const [estado, setEstado] = useState('En construcción');
    const [editando, setEditando] = useState(false);
    const [idEdit, setIdEdit] = useState(null);

    const tableRef = useRef(null); // Usamos el useRef para referenciar la tabla

    useEffect(() => {
        obtenerEdificaciones();
    }, []);

    useEffect(() => {
        if (edificaciones.length > 0 && tableRef.current) {
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
    }, [edificaciones]); // Ejecutar cuando se actualizan los datos de edificaciones

    const obtenerEdificaciones = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/edificaciones');
            setEdificaciones(response.data);
        } catch (error) {
            toast.error('❌ Error al obtener edificaciones');
        }
    };

    const agregarEdificacion = async (e) => {
        e.preventDefault();
        try {
            if (editando) {
                await axios.put(`http://localhost:5000/api/edificaciones/${idEdit}`, { nombre, direccion, tipo, estado });
                toast.success('✅ Edificación actualizada con éxito');
                setEditando(false);
                setIdEdit(null);
            } else {
                await axios.post('http://localhost:5000/api/edificaciones', { nombre, direccion, tipo, estado });
                toast.success('✅ Edificación agregada con éxito');
            }
            limpiarFormulario();
            obtenerEdificaciones();
        } catch (error) {
            toast.error('❌ Error al guardar la edificación');
        }
    };

    const eliminarEdificacion = async (id) => {
        if (!window.confirm('¿Estás seguro de eliminar esta edificación?')) return;
        try {
            await axios.delete(`http://localhost:5000/api/edificaciones/${id}`);
            toast.success('🗑️ Edificación eliminada con éxito');
            obtenerEdificaciones();
        } catch (error) {
            toast.error('❌ Error al eliminar la edificación');
        }
    };

    const editarEdificacion = (edif) => {
        setNombre(edif.nombre);
        setDireccion(edif.direccion);
        setTipo(edif.tipo);
        setEstado(edif.estado);
        setEditando(true);
        setIdEdit(edif._id);
    };

    const limpiarFormulario = () => {
        setNombre('');
        setDireccion('');
        setTipo('');
        setEstado('En construcción');
        setEditando(false);
        setIdEdit(null);
    };

    return (
        <div className="container mt-4">
            <h2>Gestión de Edificaciones</h2>

            {/* 🔥 Contenedor de Notificaciones */}
            <ToastContainer position="top-right" autoClose={3000} />

            <form onSubmit={agregarEdificacion} className="mb-4">
                <div className="row">
                    <div className="col-md-3">
                        <input type="text" className="form-control" placeholder="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
                    </div>
                    <div className="col-md-3">
                        <input type="text" className="form-control" placeholder="Dirección" value={direccion} onChange={(e) => setDireccion(e.target.value)} required />
                    </div>
                    <div className="col-md-3">
                        <input type="text" className="form-control" placeholder="Tipo" value={tipo} onChange={(e) => setTipo(e.target.value)} required />
                    </div>
                    <div className="col-md-2">
                        <select className="form-control" value={estado} onChange={(e) => setEstado(e.target.value)}>
                            <option value="En construcción">En construcción</option>
                            <option value="Terminado">Terminado</option>
                        </select>
                    </div>
                    <div className="col-md-1">
                        <button type="submit" className={`btn ${editando ? 'btn-warning' : 'btn-primary'}`}>
                            {editando ? 'Actualizar' : 'Agregar'}
                        </button>
                    </div>
                </div>
            </form>

            <table ref={tableRef} className="table table-striped">
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Dirección</th>
                        <th>Tipo</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {edificaciones.map((edif) => (
                        <tr key={edif._id}>
                            <td>{edif.nombre}</td>
                            <td>{edif.direccion}</td>
                            <td>{edif.tipo}</td>
                            <td>{edif.estado}</td>
                            <td>
                                <button className="btn btn-info btn-sm me-2" onClick={() => editarEdificacion(edif)}>Editar</button>
                                <button className="btn btn-danger btn-sm" onClick={() => eliminarEdificacion(edif._id)}>Eliminar</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default Edificaciones;
