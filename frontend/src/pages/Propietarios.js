import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import { useDropzone } from 'react-dropzone';
import 'react-toastify/dist/ReactToastify.css';
import 'datatables.net-bs5/css/dataTables.bootstrap5.min.css'; // Estilo para DataTables
import 'datatables.net-buttons-bs5/css/buttons.bootstrap5.min.css'; // Estilo para los botones de exportación
import 'datatables.net-dt/css/dataTables.dataTables.min.css'; // Estilo de DataTables
import $ from 'jquery'; // Importar jQuery
import 'datatables.net'; // Importar DataTables
import 'datatables.net-bs5'; // Estilo de DataTables con Bootstrap 5
import 'datatables.net-buttons'; // Importar los botones de DataTables (Excel, PDF, CSV, etc.)
import jsPDF from 'jspdf'; // Importar jsPDF para generar PDF
import html2pdf from 'html2pdf.js'; // Para generar PDF desde HTML

function Propietarios() {
    const [propietarios, setPropietarios] = useState([]);
    const [nombre, setNombre] = useState('');
    const [telefono, setTelefono] = useState('');
    const [email, setEmail] = useState('');
    const [foto, setFoto] = useState(null);
    const [editando, setEditando] = useState(false);
    const [idEdit, setIdEdit] = useState(null);

    const tableRef = useRef(null); // Usamos el useRef para referenciar la tabla

    // Cargar los datos de los propietarios
    useEffect(() => {
        obtenerPropietarios();
    }, []);

    // Inicialización de DataTable (con los botones de exportación)
    useEffect(() => {
        if (propietarios.length > 0 && tableRef.current) {
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
    }, [propietarios]);

    const obtenerPropietarios = async () => {
        try {
            console.log("📥 Obteniendo propietarios...");
            const response = await axios.get('http://localhost:5000/api/propietarios');
            setPropietarios(response.data);
            console.log("✅ Propietarios obtenidos:", response.data);
        } catch (error) {
            console.error("❌ Error al obtener propietarios:", error);
            toast.error("❌ Error al obtener propietarios");
        }
    };

    const agregarPropietario = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('nombre', nombre);
        formData.append('telefono', telefono);
        formData.append('email', email);
        if (foto) formData.append('foto', foto);

        try {
            if (editando) {
                console.log(`✏️ Actualizando propietario ${idEdit}`);
                await axios.put(`http://localhost:5000/api/propietarios/${idEdit}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success("✅ Propietario actualizado con éxito");
                setEditando(false);
                setIdEdit(null);
            } else {
                console.log("➕ Agregando nuevo propietario...");
                await axios.post('http://localhost:5000/api/propietarios', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success("✅ Propietario agregado con éxito");
            }
            limpiarFormulario();
            await obtenerPropietarios();
        } catch (error) {
            console.error("❌ Error al guardar propietario:", error);
            toast.error("❌ Error al guardar el propietario");
        }
    };

    const eliminarPropietario = async (id) => {
        if (!window.confirm("¿Estás seguro de eliminar este propietario?")) return;
        try {
            console.log(`🗑️ Eliminando propietario ${id}`);
            await axios.delete(`http://localhost:5000/api/propietarios/${id}`);
            toast.success("🗑️ Propietario eliminado con éxito");
            await obtenerPropietarios();
        } catch (error) {
            console.error("❌ Error al eliminar propietario:", error);
            toast.error("❌ Error al eliminar el propietario");
        }
    };

    const editarPropietario = (prop) => {
        console.log(`✏️ Editando propietario:`, prop);
        setNombre(prop.nombre || '');
        setTelefono(prop.telefono || '');
        setEmail(prop.email || '');
        setFoto(null); // No se carga la foto en la edición
        setEditando(true);
        setIdEdit(prop._id);
    };

    const limpiarFormulario = () => {
        setNombre('');
        setTelefono('');
        setEmail('');
        setFoto(null);
        setEditando(false);
        setIdEdit(null);
    };

    const { getRootProps, getInputProps } = useDropzone({
        accept: { 'image/jpeg': [], 'image/png': [], 'image/jpg': [] },
        onDrop: (acceptedFiles) => {
            if (acceptedFiles.length > 0) {
                setFoto(acceptedFiles[0]);
            } else {
                console.warn("⚠️ Formato de archivo no permitido");
                toast.warn("⚠️ Formato de archivo no permitido");
            }
        }
    });

    // Función para generar el reporte en PDF
    const generarPDF = async () => {
        const doc = new jsPDF();

        // Agregar título
        doc.setFontSize(16);
        doc.text("Reporte de Propietarios", 20, 10);

        // Diseño de tabla en PDF
        doc.setFontSize(12);
        let yOffset = 20;

        // Agregar encabezados
        doc.setFont('helvetica', 'bold');
        doc.text('Nombre', 20, yOffset);
        doc.text('Teléfono', 60, yOffset);
        doc.text('Email', 120, yOffset);
        doc.text('Foto', 170, yOffset);
        yOffset += 10;

        // Agregar datos de la tabla
        doc.setFont('helvetica', 'normal');
        for (let i = 0; i < propietarios.length; i++) {
            const prop = propietarios[i];

            // Nombre
            doc.text(prop.nombre, 20, yOffset);
            // Teléfono
            doc.text(prop.telefono, 60, yOffset);
            // Email
            doc.text(prop.email, 120, yOffset);

            // Foto
            if (prop.foto) {
                const img = `http://localhost:5000${prop.foto}`;
                const imgData = await fetch(img)
                    .then(res => res.blob())
                    .then(blob => URL.createObjectURL(blob));

                doc.addImage(imgData, 'JPEG', 170, yOffset - 10, 30, 20); // Agregar imagen (tamaño ajustable)
            }

            yOffset += 30; // Espaciado entre filas
        }

        // Guardar el documento PDF
        doc.save("reporte_propietarios.pdf");
    };

    return (
        <>
            {/* 🔥 Contenedor de Notificaciones */}
            <ToastContainer position="top-right" autoClose={3000} />

            <div className="container mt-4">
                <h2>Gestión de Propietarios</h2>

                {/* Botón para generar el reporte en PDF */}
                <button className="btn btn-success mb-3" onClick={generarPDF}>Generar Reporte</button>

                <form onSubmit={agregarPropietario} className="mb-4">
                    <div className="row">
                        <div className="col-md-3">
                            <input type="text" className="form-control" placeholder="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
                        </div>
                        <div className="col-md-3">
                            <input type="text" className="form-control" placeholder="Teléfono" value={telefono} onChange={(e) => setTelefono(e.target.value)} required />
                        </div>
                        <div className="col-md-3">
                            <input type="email" className="form-control" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                        </div>
                        <div className="col-md-3">
                            <div {...getRootProps()} className="dropzone border p-3 text-center">
                                <input {...getInputProps()} />
                                {foto ? <p>{foto.name}</p> : <p>Arrastra una imagen o haz clic aquí</p>}
                            </div>
                        </div>
                        <div className="col-md-1 mt-3">
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
                            <th>Foto</th>
                            <th>Nombre</th>
                            <th>Teléfono</th>
                            <th>Email</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {propietarios.map((prop) => (
                            <tr key={prop._id}>
                                <td>
                                    {prop.foto ? (
                                        <img src={`http://localhost:5000${prop.foto}`} alt="Foto" width="50" />
                                    ) : (
                                        <span>Sin foto</span>
                                    )}
                                </td>
                                <td>{prop.nombre}</td>
                                <td>{prop.telefono}</td>
                                <td>{prop.email}</td>
                                <td>
                                    <button className="btn btn-info btn-sm me-2" onClick={() => editarPropietario(prop)}>Editar</button>
                                    <button className="btn btn-danger btn-sm" onClick={() => eliminarPropietario(prop._id)}>Eliminar</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
}

export default Propietarios;
