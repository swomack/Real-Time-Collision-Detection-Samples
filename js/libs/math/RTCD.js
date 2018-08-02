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
    constructor(triangle) {
        this._a = new THREE.Vector2();
        this._b = new THREE.Vector2();
        this._c = new THREE.Vector2();

        this.setTriangle(triangle);
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

};


/*
 Barycentric coordinates have many uses. Because they are invariant under projection,
 they can be used to map points between different coordinate systems. They can
 be used for point-in-triangle testing.
 */

RTCD.PointInsideTriangle = class{
    constructor(_triangle) {
        this.triangle = _triangle;
        this.barycentric = new RTCD.Barycentric(_triangle);
    }

    setTriangle(_triangle) {
        this.triangle = _triangle;
        this.barycentric.setTriangle(_triangle);
    }

    isPointInsideTriangle(point) {
        let barycentricCoordinate = this.barycentric.getBarycentricCoordinate(point);

        return barycentricCoordinate.u >= 0 && barycentricCoordinate.u <= 1 &&
            barycentricCoordinate.v >= 0 && barycentricCoordinate.v <= 1 &&
            barycentricCoordinate.w >= 0 && barycentricCoordinate.w <= 1;
    }
};


/*
 Given a normal n and a point P on the plane, all points X on the plane can be
 categorized by the vector X?P being perpendicular to n, indicated by the dot product
 of the two vectors being zero. This perpendicularity gives rise to an implicit equation
 for the plane, the point-normal form of the plane:
 n · (X ? P) = 0.
 n.X - n.P = 0
 (a,b,c).(x,y,z) - d = 0
 ax + by + cz - d = 0

 ||n|| = sqrt(a^2 + b^2 + c^2)
 */
RTCD.Plane = class {

    constructor(_a, _b, _c) {
        let edge1 = new THREE.Vector3().subVectors(_b, _a);
        let edge2 = new THREE.Vector3().subVectors(_c, _a);
        this.normal = edge1.cross(edge2);
        this.normal.normalize(); // if the normal is normalized then d = distance of plane from origin with unit 1
                                // if the normal is not normalized, then d = distance of plane from origin with unit ||n||

        this.distance = this.normal.dot(_a); // n.p = d
    }
};

/*
 Assuming all vertices of the quad ABCD lie in the same plane, the quad
 is convex if and only if its two diagonals lie fully in the interior of the quad (Figure
 3.17a through c). This test is equivalent to testing if the two line segments AC and BD,
 corresponding to the diagonals, intersect each other. If they do, the quad is convex.
 If they do not, the quad is concave or self-intersecting.

 It can be shown that the intersection of the segments is equivalent to the points A
 and C lying on opposite sides of the line through BD, as well as to the points B and
 D lying on opposite sides of the line through AC. In turn, this test is equivalent to
 the triangle BDA having opposite winding to BDC, as well as ACD having opposite
 winding to ACB.The opposite winding can be detected by computing (using the cross
 products) the normals of the triangles and examining the sign of the dot product
 between the normals of the triangles to be compared. If the dot product is negative,
 the normals point in opposing directions, and the triangles therefore wind in opposite
 order.

 ((B-A)x(C-A)).((D-A)x(C-A))<0 // for triangle ACB and ACD (we are checking B and D are opposite side of AC)
 ((A-B)x(D-B)).((C-B)x(D-B))<0 // for triangle BDA and BDC (we are checking A and C are opposite side of BD)

 */
RTCD.isQuadConvex = function(_a, _b, _c, _d) {
    let diagonal1 = new THREE.Vector3().subVectors(_c, _a).normalize();
    let edge1 = new THREE.Vector3().subVectors(_b, _a).normalize();
    let edge2 = new THREE.Vector3().subVectors(_d, _a).normalize();

    if (new THREE.Vector3().crossVectors(edge1, diagonal1).dot(new THREE.Vector3().crossVectors(edge2, diagonal1)) >= 0)
        return false;

    let diagonal2 = new THREE.Vector3().subVectors(_d, _b).normalize();
    let edge3 = new THREE.Vector3().subVectors(_a, _b).normalize();
    let edge4 = new THREE.Vector3().subVectors(_c, _a).normalize();

    return new THREE.Vector3().crossVectors(edge3, diagonal2).dot(new THREE.Vector3().crossVectors(edge4, diagonal2)) < 0;
};

/*
Generally, if a polygon is convex or not can be determined in O(n^2) algorithm. We need to check for each edge, all other vertices should be
in the negative halfspace of the line gone through the endpoints of that edge.
 */
RTCD.isPolygonConvex = function(_vertices) {

};




/*
 Let A = (ax , ay), B = (bx , by), and C = (cx , cy) be three 2D points, and let
 ORIENT2D(A, B, C) be defined as
 ORIENT2D(A, B, C) =

         |ax ay 1|    | ax-cx ay-cy|
         |bx by 1|  = | bx-cx by-cy|
         |cx cy 1|

 If ORIENT2D(A, B, C) > 0, C lies to the left of the directed line AB. Equivalently,
 the triangle ABC is oriented counterclockwise. When ORIENT2D(A, B, C) < 0, C
 lies to the right of the directed line AB, and the triangle ABC is oriented clockwise.
 When ORIENT2D(A, B, C) = 0, the three points are collinear.

 More on - Real Time Collision Detection - Page 33
 */
RTCD.Side = {
    LEFT: "Left",
    RIGHT: "Right",
    LINEAR: "Linear"
};

RTCD.getSide = function(edgeVertex1, edgeVertex2, vertex) {

    let determinant = (edgeVertex1.x - vertex.x) * (edgeVertex2.y - vertex.y) - (edgeVertex2.x - vertex.x) * (edgeVertex1.y - vertex.y);

    if (determinant < 0)
        return RTCD.Side.LEFT;
    else if (determinant > 0)
        return RTCD.Side.RIGHT;
    else
        return RTCD.Side.LINEAR;
};


/*
 One of the most robust and easy to implement 2D convex hull algorithms is Andrew’s
 algorithm [Andrew79]. In its first pass, it starts by sorting all points in the given point
 set from left to right. In subsequent second and third passes, chains of edges from
 the leftmost to the rightmost point are formed, corresponding to the upper and lower
 half of the convex hull, respectively. With the chains created, the hull is obtained by
 simply connecting the two chains end to end.

 More on - Real Time Collision Detection - Page 66
 */
RTCD.AndrewsConvexHull = function(_vertices) {
    _vertices.sort(function(a,b) {
        if (a.x === b.x)
            return 0;
        else if (a.x < b.x)
            return -1;

        return 1;
    });

    let upChain = [];
    upChain.push(_vertices[0]);
    upChain.push(_vertices[1]);


    for (let i = 2; i < _vertices.length; i++) {
        let side;
        while (upChain.length > 1) {
            side = RTCD.getSide(upChain[upChain.length - 2], upChain[upChain.length - 1], _vertices[i]);

            if (side !== RTCD.Side.LEFT)
                break;

            upChain.pop();
        }

        if (side === RTCD.Side.RIGHT || side === RTCD.Side.LEFT)
            upChain.push(_vertices[i]);
    }

    let downChain = [];
    downChain.push(_vertices[0]);
    downChain.push(_vertices[1]);


    for (let i = 2; i < _vertices.length; i++) {
        let side;
        while (downChain.length > 1) {
            side = RTCD.getSide(downChain[downChain.length - 2], downChain[downChain.length - 1], _vertices[i]);

            if (side !== RTCD.Side.RIGHT)
                break;

            downChain.pop();
        }

        if (side === RTCD.Side.RIGHT || side === RTCD.Side.LEFT)
            downChain.push(_vertices[i]);
    }

    let convexHull = upChain;

    for (let i = downChain.length - 2; i > 0; i--)
        convexHull.push(downChain[i]);

    return convexHull;

};



