/**
 * Created by Sourov on 7/27/2018.
 * This library is based on threejs.
 * All the data structure has been inherited from threejs
 */

'use strict';

class RTCD {

}

/*
Given a triangle ABC, the magnitude of the cross product of two of its edges equals
 twice the area of ABC. It can be calcuted using determinant of the matrix -

 |ax  bx  cx|
 |ay  by  cy|
 |1   1   1 |

*/
function get2DTriangleArea(a, b, c) {
    return 0.5 * (a.x * (b.y - c.y) - b.x * (a.y - c.y) + c.x * (a.y - b.y));
}


/*
 An important property of barycentric coordinates is that they remain invariant
 under projection. This property allows for a potentially more efficient way of computing
 the coordinates than given earlier. Instead of computing the areas from the
 3D coordinates of the vertices, the calculations can be simplified by projecting all vertices to the xy, xz, or yz plane. To avoid degeneracies, the projection is made to
 the plane where the projected areas are the greatest. The largest absolute component
 value of the triangle normal indicates which component should be dropped during
 projection.

 Real Time Collision Detection - Page 51
 */
RTCD.Barycentric = class {
    constructor() {
        this._a = new THREE.Vector2();
        this._b = new THREE.Vector2();
        this._c = new THREE.Vector2();
    }

    getAreaOnXYPlane(a, b, c) {
        this._a.set(a.x, a.y);
        this._b.set(b.x, b.y);
        this._c.set(c.x, c.y);

        return get2DTriangleArea(this._a, this._b, this._c);
    }

    getAreaOnXZPlane(a, b, c) {
        this._a.set(a.x, a.z);
        this._b.set(b.x, b.z);
        this._c.set(c.x, c.z);

        return get2DTriangleArea(this._a, this._b, this._c);
    }

    getAreaOnYZPlane (a, b, c) {
        this._a.set(a.y, a.z);
        this._b.set(b.y, b.z);
        this._c.set(c.y, c.z);

        return get2DTriangleArea(this._a, this._b, this._c);
    }

    setTriangle(triangle) {
        this.triangle = triangle;
        this.normal = this.triangle.getNormal();

        if (Math.abs(this.normal.x) > Math.max(Math.abs(this.normal.y), Math.abs(this.normal.z)))
            this.calculate2DArea = getAreaOnYZPlane;
        else if (Math.abs(this.normal.y) > Math.max(Math.abs(this.normal.x), Math.abs(this.normal.z)))
            this.calculate2DArea = getAreaOnXZPlane;
        else
            this.calculate2DArea = this.getAreaOnXYPlane;
    }

    getBarycentricCoordinate(point) {
        let area1 = this.calculate2DArea(point, this.triangle.b, this.triangle.c);
        let area2 = this.calculate2DArea(point, this.triangle.c, this.triangle.a);
        let totalArea = this.calculate2DArea(this.triangle.a, this.triangle.b, this.triangle.c);

        let u = area1 / totalArea;
        let v = area2 / totalArea;
        let w = 1 - u - v;

        return {
            u,
            v,
            w
        }
    }

}


