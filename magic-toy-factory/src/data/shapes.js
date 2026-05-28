import { getBox, getSphere, getCone, getCylinder, getTorus, getDodecahedron, getTorusKnot, getOctahedron } from '../objects/createBasicShapes.js';
import { getTeapot } from '../objects/createTeapot.js';

export const shapeCreators = [
    { label: 'Khối Hộp', fn: () => getBox(1.5, 1.5, 1.5) },
    { label: 'Khối Cầu', fn: () => getSphere(1) },
    { label: 'Khối Nón', fn: () => getCone(1, 2) },
    { label: 'Khối Trụ', fn: () => getCylinder(0.8, 1.5) },
    { label: 'Bánh Xe', fn: () => getTorus(0.6, 0.25) },
    { label: 'Khối Đá Quý', fn: () => getDodecahedron(1) },
    { label: 'Ấm Trà', fn: () => getTeapot(0.8) },
    { label: 'Khối Thắt Nút', fn: () => getTorusKnot(0.6, 0.2) },
    { label: 'Khối 8 Mặt', fn: () => getOctahedron(1) }
];