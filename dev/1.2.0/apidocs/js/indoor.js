/*
 * Poly2Tri Copyright (c) 2009-2010, Poly2Tri Contributors
 * http://code.google.com/p/poly2tri/
 *
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *
 * * Redistributions of source code must retain the above copyright notice,
 *   this list of conditions and the following disclaimer.
 * * Redistributions in binary form must reproduce the above copyright notice,
 *   this list of conditions and the following disclaimer in the documentation
 *   and/or other materials provided with the distribution.
 * * Neither the name of Poly2Tri nor the names of its contributors may be
 *   used to endorse or promote products derived from this software without specific
 *   prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR
 * CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 * EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 * PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 * PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 * LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

var jspoly2tri={};if(typeof module!="undefined")module.exports=jspoly2tri;jspoly2tri.Point=function(){this.y=this.x=null;if(arguments.length==0)this.y=this.x=0;else if(arguments.length==2){this.x=arguments[0];this.y=arguments[1]}else throw"Invalid jspoly2tri.Point constructor call!";this.edge_list=[]};jspoly2tri.Point.prototype.set_zero=function(){this.y=this.x=0};jspoly2tri.Point.prototype.set=function(a,b){this.x=a;this.y=b};jspoly2tri.Point.prototype.negate=function(){this.x=-this.x;this.y=-this.y};
jspoly2tri.Point.prototype.add=function(a){this.x+=a.x;this.y+=a.y};jspoly2tri.Point.prototype.sub=function(a){this.x-=a.x;this.y-=a.y};jspoly2tri.Point.prototype.mul=function(a){this.x*=a;this.y*=a};jspoly2tri.Point.prototype.length=function(){return Math.sqrt(this.x*this.x+this.y*this.y)};jspoly2tri.Point.prototype.normalize=function(){var a=this.length();this.x/=a;this.y/=a;return a};jspoly2tri.Point.prototype.equals=function(a){return jspoly2tri.equals(this,a)};
jspoly2tri.negate=function(a){return new jspoly2tri.Point(-a.x,-a.y)};jspoly2tri.cmp=function(a,b){return a.y==b.y?a.x-b.x:a.y-b.y};jspoly2tri.add=function(a,b){return new jspoly2tri.Point(a.x+b.x,a.y+b.y)};jspoly2tri.sub=function(a,b){return new jspoly2tri.Point(a.x-b.x,a.y-b.y)};jspoly2tri.mul=function(a,b){return new jspoly2tri.Point(a*b.x,a*b.y)};jspoly2tri.equals=function(a,b){return a.x==b.x&&a.y==b.y};jspoly2tri.dot=function(a,b){return a.x*b.x+a.y*b.y};
jspoly2tri.cross=function(){var a=false,b=false;if(arguments.length==2){if(typeof arguments[0]=="number")a=true;if(typeof(arguments[1]=="number"))b=true;return a?b?arguments[0].x*arguments[1].y-arguments[0].y*arguments[1].x:new jspoly2tri.Point(arguments[1]*arguments[0].y,-arguments[1]*arguments[0].x):b?new jspoly2tri.Point(-arguments[0]*arguments[1].y,arguments[0]*arguments[1].x):arguments[0]*arguments[1]}else throw"Invalid jspoly2tri.cross call!";};
jspoly2tri.Edge=function(){this.q=this.p=null;if(arguments.length==2)if(arguments[0].y>arguments[1].y){this.q=arguments[0];this.p=arguments[1]}else if(arguments[0].y==arguments[1].y)if(arguments[0].x>arguments[1].x){this.q=arguments[0];this.p=arguments[1]}else if(arguments[0].x==arguments[1].x)throw"Invalid jspoly2tri.edge constructor call: repeated points!";else{this.p=arguments[0];this.q=arguments[1]}else{this.p=arguments[0];this.q=arguments[1]}else throw"Invalid jspoly2tri.Edge constructor call!";
this.q.edge_list.push(this)};jspoly2tri.Triangle=function(a,b,c){this.points_=[null,null,null];this.neighbors_=[null,null,null];this.interior_=false;this.constrained_edge=[false,false,false];this.delaunay_edge=[false,false,false];if(arguments.length==3){this.points_[0]=a;this.points_[1]=b;this.points_[2]=c}};jspoly2tri.Triangle.prototype.GetPoint=function(a){return this.points_[a]};jspoly2tri.Triangle.prototype.GetNeighbor=function(a){return this.neighbors_[a]};
jspoly2tri.Triangle.prototype.ContainsP=function(){for(var a=true,b=0;b<arguments.length;++b)a=a&&(arguments[b].equals(this.points_[0])||arguments[b].equals(this.points_[1])||arguments[b].equals(this.points_[2]));return a};jspoly2tri.Triangle.prototype.ContainsE=function(){for(var a=true,b=0;b<arguments.length;++b)a=a&&this.ContainsP(arguments[b].p,arguments[b].q);return a};jspoly2tri.Triangle.prototype.IsInterior=function(){if(arguments.length!=0)this.interior_=arguments[0];return this.interior_};
jspoly2tri.Triangle.prototype.MarkNeighbor=function(){var a;if(arguments.length==3){var b=arguments[0],c=arguments[1];a=arguments[2];if(b.equals(this.points_[2])&&c.equals(this.points_[1])||b.equals(this.points_[1])&&c.equals(this.points_[2]))this.neighbors_[0]=a;else if(b.equals(this.points_[0])&&c.equals(this.points_[2])||b.equals(this.points_[2])&&c.equals(this.points_[0]))this.neighbors_[1]=a;else if(b.equals(this.points_[0])&&c.equals(this.points_[1])||b.equals(this.points_[1])&&c.equals(this.points_[0]))this.neighbors_[2]=
a;else{console.log(b.x+","+b.y+","+c.x+","+c.y+","+a.x+","+a.y+"\n");console.log(this.points_[0].x+","+this.points_[0].y+","+this.points_[1].x+","+this.points_[1].y+","+this.points_[2].x+","+this.points_[2].y+"\n");throw"Invalid jspoly2tri.Triangle.MarkNeighbor call (1)!";}}else if(arguments.length==1){a=arguments[0];if(a.ContainsP(this.points_[1],this.points_[2])){this.neighbors_[0]=a;a.MarkNeighbor(this.points_[1],this.points_[2],this)}else if(a.ContainsP(this.points_[0],this.points_[2])){this.neighbors_[1]=
a;a.MarkNeighbor(this.points_[0],this.points_[2],this)}else if(a.ContainsP(this.points_[0],this.points_[1])){this.neighbors_[2]=a;a.MarkNeighbor(this.points_[0],this.points_[1],this)}}else throw"Invalid jspoly2tri.Triangle.MarkNeighbor call! (2)";};jspoly2tri.Triangle.prototype.ClearNeigbors=function(){this.neighbors_[0]=null;this.neighbors_[1]=null;this.neighbors_[2]=null};
jspoly2tri.Triangle.prototype.ClearDelunayEdges=function(){this.delaunay_edge[0]=false;this.delaunay_edge[1]=false;this.delaunay_edge[2]=false};jspoly2tri.Triangle.prototype.PointCW=function(a){return a.equals(this.points_[0])?this.points_[2]:a.equals(this.points_[1])?this.points_[0]:a.equals(this.points_[2])?this.points_[1]:null};
jspoly2tri.Triangle.prototype.PointCCW=function(a){return a.equals(this.points_[0])?this.points_[1]:a.equals(this.points_[1])?this.points_[2]:a.equals(this.points_[2])?this.points_[0]:null};jspoly2tri.Triangle.prototype.NeighborCW=function(a){return a.equals(this.points_[0])?this.neighbors_[1]:a.equals(this.points_[1])?this.neighbors_[2]:this.neighbors_[0]};
jspoly2tri.Triangle.prototype.NeighborCCW=function(a){return a.equals(this.points_[0])?this.neighbors_[2]:a.equals(this.points_[1])?this.neighbors_[0]:this.neighbors_[1]};jspoly2tri.Triangle.prototype.GetConstrainedEdgeCW=function(a){return a.equals(this.points_[0])?this.constrained_edge[1]:a.equals(this.points_[1])?this.constrained_edge[2]:this.constrained_edge[0]};
jspoly2tri.Triangle.prototype.GetConstrainedEdgeCCW=function(a){return a.equals(this.points_[0])?this.constrained_edge[2]:a.equals(this.points_[1])?this.constrained_edge[0]:this.constrained_edge[1]};jspoly2tri.Triangle.prototype.SetConstrainedEdgeCW=function(a,b){if(a.equals(this.points_[0]))this.constrained_edge[1]=b;else if(a.equals(this.points_[1]))this.constrained_edge[2]=b;else this.constrained_edge[0]=b};
jspoly2tri.Triangle.prototype.SetConstrainedEdgeCCW=function(a,b){if(a.equals(this.points_[0]))this.constrained_edge[2]=b;else if(a.equals(this.points_[1]))this.constrained_edge[0]=b;else this.constrained_edge[1]=b};jspoly2tri.Triangle.prototype.GetDelaunayEdgeCW=function(a){return a.equals(this.points_[0])?this.delaunay_edge[1]:a.equals(this.points_[1])?this.delaunay_edge[2]:this.delaunay_edge[0]};
jspoly2tri.Triangle.prototype.GetDelaunayEdgeCCW=function(a){return a.equals(this.points_[0])?this.delaunay_edge[2]:a.equals(this.points_[1])?this.delaunay_edge[0]:this.delaunay_edge[1]};jspoly2tri.Triangle.prototype.SetDelaunayEdgeCW=function(a,b){if(a.equals(this.points_[0]))this.delaunay_edge[1]=b;else if(a.equals(this.points_[1]))this.delaunay_edge[2]=b;else this.delaunay_edge[0]=b};
jspoly2tri.Triangle.prototype.SetDelaunayEdgeCCW=function(a,b){if(a.equals(this.points_[0]))this.delaunay_edge[2]=b;else if(a.equals(this.points_[1]))this.delaunay_edge[0]=b;else this.delaunay_edge[1]=b};jspoly2tri.Triangle.prototype.NeighborAcross=function(a){return a.equals(this.points_[0])?this.neighbors_[0]:a.equals(this.points_[1])?this.neighbors_[1]:this.neighbors_[2]};jspoly2tri.Triangle.prototype.OppositePoint=function(a,b){return this.PointCW(a.PointCW(b))};
jspoly2tri.Triangle.prototype.Legalize=function(){if(arguments.length==1)this.Legalize(this.points_[0],arguments[0]);else if(arguments.length==2){var a=arguments[0],b=arguments[1];if(a.equals(this.points_[0])){this.points_[1]=this.points_[0];this.points_[0]=this.points_[2];this.points_[2]=b}else if(a.equals(this.points_[1])){this.points_[2]=this.points_[1];this.points_[1]=this.points_[0];this.points_[0]=b}else if(a.equals(this.points_[2])){this.points_[0]=this.points_[2];this.points_[2]=this.points_[1];
this.points_[1]=b}else throw"Invalid jspoly2tri.Triangle.Legalize call!";}else throw"Invalid jspoly2tri.Triangle.Legalize call!";};jspoly2tri.Triangle.prototype.Index=function(a){return a.equals(this.points_[0])?0:a.equals(this.points_[1])?1:a.equals(this.points_[2])?2:-1};
jspoly2tri.Triangle.prototype.EdgeIndex=function(a,b){if(a.equals(this.points_[0]))if(b.equals(this.points_[1]))return 2;else{if(b.equals(this.points_[2]))return 1}else if(a.equals(this.points_[1]))if(b.equals(this.points_[2]))return 0;else{if(b.equals(this.points_[0]))return 2}else if(a.equals(this.points_[2]))if(b.equals(this.points_[0]))return 1;else if(b.equals(this.points_[1]))return 0;return-1};
jspoly2tri.Triangle.prototype.MarkConstrainedEdge=function(){if(arguments.length==1)if(typeof arguments[0]=="number")this.constrained_edge[arguments[0]]=true;else this.MarkConstrainedEdge(arguments[0].p,arguments[0].q);else if(arguments.length==2){var a=arguments[0],b=arguments[1];if(b.equals(this.points_[0])&&a.equals(this.points_[1])||b.equals(this.points_[1])&&a.equals(this.points_[0]))this.constrained_edge[2]=true;else if(b.equals(this.points_[0])&&a.equals(this.points_[2])||b.equals(this.points_[2])&&
a.equals(this.points_[0]))this.constrained_edge[1]=true;else if(b.equals(this.points_[1])&&a.equals(this.points_[2])||b.equals(this.points_[2])&&a.equals(this.points_[1]))this.constrained_edge[0]=true}else throw"Invalid jspoly2tri.Triangle.MarkConstrainedEdge call!";};jspoly2tri.PI_3div4=3*Math.PI/4;jspoly2tri.PI_2=Math.PI/2;jspoly2tri.EPSILON=1.0E-12;jspoly2tri.kAlpha=0.3;jspoly2tri.Orientation={CW:1,CCW:-1,COLLINEAR:0};
jspoly2tri.Orient2d=function(a,b,c){a=(a.x-c.x)*(b.y-c.y)-(a.y-c.y)*(b.x-c.x);return a>-jspoly2tri.EPSILON&&a<jspoly2tri.EPSILON?jspoly2tri.Orientation.COLLINEAR:a>0?jspoly2tri.Orientation.CCW:jspoly2tri.Orientation.CW};jspoly2tri.InScanArea=function(a,b,c,d){var e=d.x;d=d.y;var f=a.x-e;a=a.y-d;if(f*(b.y-d)-(b.x-e)*a<=jspoly2tri.EPSILON)return false;if((c.x-e)*a-f*(c.y-d)<=jspoly2tri.EPSILON)return false;return true};
jspoly2tri.Node=function(){this.prev=this.next=this.triangle=this.point=null;this.value=0;if(arguments.length==1){this.point=arguments[0];this.value=this.point.x}else if(arguments.length==2){this.point=arguments[0];this.triangle=arguments[1];this.value=this.point.x}else throw"Invalid jspoly2tri.Node constructor call!";};jspoly2tri.AdvancingFront=function(a,b){this.head_=a;this.tail_=b;this.search_node_=a};jspoly2tri.AdvancingFront.prototype.head=function(){return this.head_};
jspoly2tri.AdvancingFront.prototype.set_head=function(a){this.head_=a};jspoly2tri.AdvancingFront.prototype.tail=function(){return this.tail_};jspoly2tri.AdvancingFront.prototype.set_tail=function(a){this.tail_=a};jspoly2tri.AdvancingFront.prototype.search=function(){return this.search_node_};jspoly2tri.AdvancingFront.prototype.set_search=function(a){this.search_node_=a};jspoly2tri.AdvancingFront.prototype.FindSearchNode=function(){return this.search_node_};
jspoly2tri.AdvancingFront.prototype.LocateNode=function(a){var b=this.search_node_;if(a<b.value)for(;(b=b.prev)!=null;){if(a>=b.value)return this.search_node_=b}else for(;(b=b.next)!=null;)if(a<b.value)return this.search_node_=b.prev;return null};
jspoly2tri.AdvancingFront.prototype.LocatePoint=function(a){var b=a.x,c=this.FindSearchNode(b),d=c.point.x;if(b==d)if(c.prev&&a.equals(c.prev.point))c=c.prev;else if(c.next&&a.equals(c.next.point))c=c.next;else{if(!a.equals(c.point))throw"Invalid jspoly2tri.AdvancingFront.LocatePoint call!";}else if(b<d)for(;(c=c.prev)!=null;){if(a.equals(c.point))break}else for(;(c=c.next)!=null;)if(a.equals(c.point))break;if(c!=null)this.search_node_=c;return c};
jspoly2tri.Basin=function(){this.right_node=this.bottom_node=this.left_node=null;this.width=0;this.left_highest=false};jspoly2tri.Basin.prototype.Clear=function(){this.right_node=this.bottom_node=this.left_node=null;this.width=0;this.left_highest=false};jspoly2tri.EdgeEvent=function(){this.constrained_edge=null;this.right=false};
jspoly2tri.SweepContext=function(a){this.triangles_=[];this.map_=[];this.points_=a;this.edge_list=[];this.af_tail_=this.af_middle_=this.af_head_=this.tail_=this.head_=this.front_=null;this.basin=new jspoly2tri.Basin;this.edge_event=new jspoly2tri.EdgeEvent;this.InitEdges(this.points_)};jspoly2tri.SweepContext.prototype.AddHole=function(a){this.InitEdges(a);for(var b in a)this.points_.push(a[b])};jspoly2tri.SweepContext.prototype.front=function(){return this.front_};
jspoly2tri.SweepContext.prototype.point_count=function(){return this.points_.length};jspoly2tri.SweepContext.prototype.head=function(){return this.head_};jspoly2tri.SweepContext.prototype.set_head=function(a){this.head_=a};jspoly2tri.SweepContext.prototype.tail=function(){return this.tail_};jspoly2tri.SweepContext.prototype.set_tail=function(a){this.tail_=a};jspoly2tri.SweepContext.prototype.GetTriangles=function(){return this.triangles_};jspoly2tri.SweepContext.prototype.GetMap=function(){return this.map_};
jspoly2tri.SweepContext.prototype.InitTriangulation=function(){var a=this.points_[0].x,b=this.points_[0].x,c=this.points_[0].y,d=this.points_[0].y,e;for(e in this.points_){var f=this.points_[e];if(f.x>a)a=f.x;if(f.x<b)b=f.x;if(f.y>c)c=f.y;if(f.y<d)d=f.y}c=jspoly2tri.kAlpha*(c-d);this.head_=new jspoly2tri.Point(a+jspoly2tri.kAlpha*(a-b),d-c);this.tail_=new jspoly2tri.Point(b-c,d-c);this.points_.sort(jspoly2tri.cmp)};
jspoly2tri.SweepContext.prototype.InitEdges=function(a){for(var b=0;b<a.length;++b)this.edge_list.push(new jspoly2tri.Edge(a[b],a[(b+1)%a.length]))};jspoly2tri.SweepContext.prototype.GetPoint=function(a){return this.points_[a]};jspoly2tri.SweepContext.prototype.AddToMap=function(a){this.map_.push(a)};jspoly2tri.SweepContext.prototype.LocateNode=function(a){return this.front_.LocateNode(a.x)};
jspoly2tri.SweepContext.prototype.CreateAdvancingFront=function(){var a,b,c;c=new jspoly2tri.Triangle(this.points_[0],this.tail_,this.head_);this.map_.push(c);a=new jspoly2tri.Node(c.GetPoint(1),c);b=new jspoly2tri.Node(c.GetPoint(0),c);c=new jspoly2tri.Node(c.GetPoint(2));this.front_=new jspoly2tri.AdvancingFront(a,c);a.next=b;b.next=c;b.prev=a;c.prev=b};jspoly2tri.SweepContext.prototype.RemoveNode=function(){};
jspoly2tri.SweepContext.prototype.MapTriangleToNodes=function(a){for(var b=0;b<3;++b)if(a.GetNeighbor(b)==null){var c=this.front_.LocatePoint(a.PointCW(a.GetPoint(b)));if(c!=null)c.triangle=a}};jspoly2tri.SweepContext.prototype.RemoveFromMap=function(a){for(var b in this.map_)if(this.map_[b]==a){delete this.map_[b];break}};jspoly2tri.SweepContext.prototype.MeshClean=function(a){if(a!=null&&!a.IsInterior()){a.IsInterior(true);this.triangles_.push(a);for(var b=0;b<3;++b)a.constrained_edge[b]||this.MeshClean(a.GetNeighbor(b))}};
jspoly2tri.sweep={};jspoly2tri.sweep.Triangulate=function(a){a.InitTriangulation();a.CreateAdvancingFront();jspoly2tri.sweep.SweepPoints(a);jspoly2tri.sweep.FinalizationPolygon(a)};jspoly2tri.sweep.SweepPoints=function(a){for(var b=1;b<a.point_count();++b)for(var c=a.GetPoint(b),d=jspoly2tri.sweep.PointEvent(a,c),e=0;e<c.edge_list.length;++e)jspoly2tri.sweep.EdgeEvent(a,c.edge_list[e],d)};
jspoly2tri.sweep.FinalizationPolygon=function(a){for(var b=a.front().head().next.triangle,c=a.front().head().next.point;!b.GetConstrainedEdgeCW(c);)b=b.NeighborCCW(c);a.MeshClean(b)};jspoly2tri.sweep.PointEvent=function(a,b){var c=a.LocateNode(b),d=jspoly2tri.sweep.NewFrontTriangle(a,b,c);b.x<=c.point.x+jspoly2tri.EPSILON&&jspoly2tri.sweep.Fill(a,c);jspoly2tri.sweep.FillAdvancingFront(a,d);return d};
jspoly2tri.sweep.EdgeEvent=function(){var a;if(arguments.length==3){a=arguments[0];var b=arguments[1],c=arguments[2];a.edge_event.constrained_edge=b;a.edge_event.right=b.p.x>b.q.x;if(!jspoly2tri.sweep.IsEdgeSideOfTriangle(c.triangle,b.p,b.q)){jspoly2tri.sweep.FillEdgeEvent(a,b,c);jspoly2tri.sweep.EdgeEvent(a,b.p,b.q,c.triangle,b.q)}}else if(arguments.length==5){a=arguments[0];b=arguments[1];c=arguments[2];var d=arguments[3],e=arguments[4];if(!jspoly2tri.sweep.IsEdgeSideOfTriangle(d,b,c)){var f=d.PointCCW(e),
g=jspoly2tri.Orient2d(c,f,b);if(g==jspoly2tri.Orientation.COLLINEAR)throw[{x:c.x,y:c.y},{x:f.x,y:f.y},{x:b.x,y:b.y}];f=d.PointCW(e);var h=jspoly2tri.Orient2d(c,f,b);if(h==jspoly2tri.Orientation.COLLINEAR)throw[{x:c.x,y:c.y},{x:f.x,y:f.y},{x:b.x,y:b.y}];if(g==h){d=g==jspoly2tri.Orientation.CW?d.NeighborCCW(e):d.NeighborCW(e);jspoly2tri.sweep.EdgeEvent(a,b,c,d,e)}else jspoly2tri.sweep.FlipEdgeEvent(a,b,c,d,e)}}else throw"Invalid jspoly2tri.sweep.EdgeEvent call!";};
jspoly2tri.sweep.IsEdgeSideOfTriangle=function(a,b,c){var d=a.EdgeIndex(b,c);if(d!=-1){a.MarkConstrainedEdge(d);a=a.GetNeighbor(d);a!=null&&a.MarkConstrainedEdge(b,c);return true}return false};jspoly2tri.sweep.NewFrontTriangle=function(a,b,c){var d=new jspoly2tri.Triangle(b,c.point,c.next.point);d.MarkNeighbor(c.triangle);a.AddToMap(d);b=new jspoly2tri.Node(b);b.next=c.next;b.prev=c;c.next.prev=b;c.next=b;jspoly2tri.sweep.Legalize(a,d)||a.MapTriangleToNodes(d);return b};
jspoly2tri.sweep.Fill=function(a,b){var c=new jspoly2tri.Triangle(b.prev.point,b.point,b.next.point);c.MarkNeighbor(b.prev.triangle);c.MarkNeighbor(b.triangle);a.AddToMap(c);b.prev.next=b.next;b.next.prev=b.prev;jspoly2tri.sweep.Legalize(a,c)||a.MapTriangleToNodes(c)};
jspoly2tri.sweep.FillAdvancingFront=function(a,b){for(var c=b.next,d;c.next!=null;){d=jspoly2tri.sweep.HoleAngle(c);if(d>jspoly2tri.PI_2||d<-jspoly2tri.PI_2)break;jspoly2tri.sweep.Fill(a,c);c=c.next}for(c=b.prev;c.prev!=null;){d=jspoly2tri.sweep.HoleAngle(c);if(d>jspoly2tri.PI_2||d<-jspoly2tri.PI_2)break;jspoly2tri.sweep.Fill(a,c);c=c.prev}if(b.next!=null&&b.next.next!=null){d=jspoly2tri.sweep.BasinAngle(b);d<jspoly2tri.PI_3div4&&jspoly2tri.sweep.FillBasin(a,b)}};
jspoly2tri.sweep.BasinAngle=function(a){return Math.atan2(a.point.y-a.next.next.point.y,a.point.x-a.next.next.point.x)};jspoly2tri.sweep.HoleAngle=function(a){var b=a.next.point.x-a.point.x,c=a.next.point.y-a.point.y,d=a.prev.point.x-a.point.x;a=a.prev.point.y-a.point.y;return Math.atan2(b*a-c*d,b*d+c*a)};
jspoly2tri.sweep.Legalize=function(a,b){for(var c=0;c<3;++c)if(!b.delaunay_edge[c]){var d=b.GetNeighbor(c);if(d!=null){var e=b.GetPoint(c),f=d.OppositePoint(b,e),g=d.Index(f);if(d.constrained_edge[g]||d.delaunay_edge[g])b.constrained_edge[c]=d.constrained_edge[g];else if(jspoly2tri.sweep.Incircle(e,b.PointCCW(e),b.PointCW(e),f)){b.delaunay_edge[c]=true;d.delaunay_edge[g]=true;jspoly2tri.sweep.RotateTrianglePair(b,e,d,f);(e=!jspoly2tri.sweep.Legalize(a,b))&&a.MapTriangleToNodes(b);(e=!jspoly2tri.sweep.Legalize(a,
d))&&a.MapTriangleToNodes(d);b.delaunay_edge[c]=false;d.delaunay_edge[g]=false;return true}}}return false};jspoly2tri.sweep.Incircle=function(a,b,c,d){var e=a.x-d.x;a=a.y-d.y;var f=b.x-d.x;b=b.y-d.y;var g=e*b-f*a;if(g<=0)return false;var h=c.x-d.x;c=c.y-d.y;d=h*a-e*c;if(d<=0)return false;return(e*e+a*a)*(f*c-h*b)+(f*f+b*b)*d+(h*h+c*c)*g>0};
jspoly2tri.sweep.RotateTrianglePair=function(a,b,c,d){var e,f,g,h;e=a.NeighborCCW(b);f=a.NeighborCW(b);g=c.NeighborCCW(d);h=c.NeighborCW(d);var i,j,k,l;i=a.GetConstrainedEdgeCCW(b);j=a.GetConstrainedEdgeCW(b);k=c.GetConstrainedEdgeCCW(d);l=c.GetConstrainedEdgeCW(d);var m,n,o,p;m=a.GetDelaunayEdgeCCW(b);n=a.GetDelaunayEdgeCW(b);o=c.GetDelaunayEdgeCCW(d);p=c.GetDelaunayEdgeCW(d);a.Legalize(b,d);c.Legalize(d,b);c.SetDelaunayEdgeCCW(b,m);a.SetDelaunayEdgeCW(b,n);a.SetDelaunayEdgeCCW(d,o);c.SetDelaunayEdgeCW(d,
p);c.SetConstrainedEdgeCCW(b,i);a.SetConstrainedEdgeCW(b,j);a.SetConstrainedEdgeCCW(d,k);c.SetConstrainedEdgeCW(d,l);a.ClearNeigbors();c.ClearNeigbors();e&&c.MarkNeighbor(e);f&&a.MarkNeighbor(f);g&&a.MarkNeighbor(g);h&&c.MarkNeighbor(h);a.MarkNeighbor(c)};
jspoly2tri.sweep.FillBasin=function(a,b){a.basin.left_node=jspoly2tri.Orient2d(b.point,b.next.point,b.next.next.point)==jspoly2tri.Orientation.CCW?b.next.next:b.next;for(a.basin.bottom_node=a.basin.left_node;a.basin.bottom_node.next!=null&&a.basin.bottom_node.point.y>=a.basin.bottom_node.next.point.y;)a.basin.bottom_node=a.basin.bottom_node.next;if(a.basin.bottom_node!=a.basin.left_node){for(a.basin.right_node=a.basin.bottom_node;a.basin.right_node.next!=null&&a.basin.right_node.point.y<a.basin.right_node.next.point.y;)a.basin.right_node=
a.basin.right_node.next;if(a.basin.right_node!=a.basin.bottom_node){a.basin.width=a.basin.right_node.point.x-a.basin.left_node.point.x;a.basin.left_highest=a.basin.left_node.point.y>a.basin.right_node.point.y;jspoly2tri.sweep.FillBasinReq(a,a.basin.bottom_node)}}};
jspoly2tri.sweep.FillBasinReq=function(a,b){if(!jspoly2tri.sweep.IsShallow(a,b)){jspoly2tri.sweep.Fill(a,b);var c;if(!(b.prev==a.basin.left_node&&b.next==a.basin.right_node)){if(b.prev==a.basin.left_node){c=jspoly2tri.Orient2d(b.point,b.next.point,b.next.next.point);if(c==jspoly2tri.Orientation.CW)return;b=b.next}else if(b.next==a.basin.right_node){c=jspoly2tri.Orient2d(b.point,b.prev.point,b.prev.prev.point);if(c==jspoly2tri.Orientation.CCW)return;b=b.prev}else b=b.prev.point.y<b.next.point.y?b.prev:
b.next;jspoly2tri.sweep.FillBasinReq(a,b)}}};jspoly2tri.sweep.IsShallow=function(a,b){if(a.basin.width>(a.basin.left_highest?a.basin.left_node.point.y-b.point.y:a.basin.right_node.point.y-b.point.y))return true;return false};jspoly2tri.sweep.FillEdgeEvent=function(a,b,c){a.edge_event.right?jspoly2tri.sweep.FillRightAboveEdgeEvent(a,b,c):jspoly2tri.sweep.FillLeftAboveEdgeEvent(a,b,c)};
jspoly2tri.sweep.FillRightAboveEdgeEvent=function(a,b,c){for(;c.next.point.x<b.p.x;)if(jspoly2tri.Orient2d(b.q,c.next.point,b.p)==jspoly2tri.Orientation.CCW)jspoly2tri.sweep.FillRightBelowEdgeEvent(a,b,c);else c=c.next};
jspoly2tri.sweep.FillRightBelowEdgeEvent=function(a,b,c){if(c.point.x<b.p.x)if(jspoly2tri.Orient2d(c.point,c.next.point,c.next.next.point)==jspoly2tri.Orientation.CCW)jspoly2tri.sweep.FillRightConcaveEdgeEvent(a,b,c);else{jspoly2tri.sweep.FillRightConvexEdgeEvent(a,b,c);jspoly2tri.sweep.FillRightBelowEdgeEvent(a,b,c)}};
jspoly2tri.sweep.FillRightConcaveEdgeEvent=function(a,b,c){jspoly2tri.sweep.Fill(a,c.next);c.next.point!=b.p&&jspoly2tri.Orient2d(b.q,c.next.point,b.p)==jspoly2tri.Orientation.CCW&&jspoly2tri.Orient2d(c.point,c.next.point,c.next.next.point)==jspoly2tri.Orientation.CCW&&jspoly2tri.sweep.FillRightConcaveEdgeEvent(a,b,c)};
jspoly2tri.sweep.FillRightConvexEdgeEvent=function(a,b,c){if(jspoly2tri.Orient2d(c.next.point,c.next.next.point,c.next.next.next.point)==jspoly2tri.Orientation.CCW)jspoly2tri.sweep.FillRightConcaveEdgeEvent(a,b,c.next);else jspoly2tri.Orient2d(b.q,c.next.next.point,b.p)==jspoly2tri.Orientation.CCW&&jspoly2tri.sweep.FillRightConvexEdgeEvent(a,b,c.next)};
jspoly2tri.sweep.FillLeftAboveEdgeEvent=function(a,b,c){for(;c.prev.point.x>b.p.x;)if(jspoly2tri.Orient2d(b.q,c.prev.point,b.p)==jspoly2tri.Orientation.CW)jspoly2tri.sweep.FillLeftBelowEdgeEvent(a,b,c);else c=c.prev};
jspoly2tri.sweep.FillLeftBelowEdgeEvent=function(a,b,c){if(c.point.x>b.p.x)if(jspoly2tri.Orient2d(c.point,c.prev.point,c.prev.prev.point)==jspoly2tri.Orientation.CW)jspoly2tri.sweep.FillLeftConcaveEdgeEvent(a,b,c);else{jspoly2tri.sweep.FillLeftConvexEdgeEvent(a,b,c);jspoly2tri.sweep.FillLeftBelowEdgeEvent(a,b,c)}};
jspoly2tri.sweep.FillLeftConvexEdgeEvent=function(a,b,c){if(jspoly2tri.Orient2d(c.prev.point,c.prev.prev.point,c.prev.prev.prev.point)==jspoly2tri.Orientation.CW)jspoly2tri.sweep.FillLeftConcaveEdgeEvent(a,b,c.prev);else jspoly2tri.Orient2d(b.q,c.prev.prev.point,b.p)==jspoly2tri.Orientation.CW&&jspoly2tri.sweep.FillLeftConvexEdgeEvent(a,b,c.prev)};
jspoly2tri.sweep.FillLeftConcaveEdgeEvent=function(a,b,c){jspoly2tri.sweep.Fill(a,c.prev);c.prev.point!=b.p&&jspoly2tri.Orient2d(b.q,c.prev.point,b.p)==jspoly2tri.Orientation.CW&&jspoly2tri.Orient2d(c.point,c.prev.point,c.prev.prev.point)==jspoly2tri.Orientation.CW&&jspoly2tri.sweep.FillLeftConcaveEdgeEvent(a,b,c)};
jspoly2tri.sweep.FlipEdgeEvent=function(a,b,c,d,e){var f=d.NeighborAcross(e);if(f==null)throw"[BUG:FIXME] FLIP failed due to missing triangle!";var g=f.OppositePoint(d,e);if(jspoly2tri.InScanArea(e,d.PointCCW(e),d.PointCW(e),g)){jspoly2tri.sweep.RotateTrianglePair(d,e,f,g);a.MapTriangleToNodes(d);a.MapTriangleToNodes(f);if(e==c&&g==b){if(c==a.edge_event.constrained_edge.q&&b==a.edge_event.constrained_edge.p){d.MarkConstrainedEdge(b,c);f.MarkConstrainedEdge(b,c);jspoly2tri.sweep.Legalize(a,d);jspoly2tri.sweep.Legalize(a,
f)}}else{var h=jspoly2tri.Orient2d(c,g,b);d=jspoly2tri.sweep.NextFlipTriangle(a,h,d,f,e,g);jspoly2tri.sweep.FlipEdgeEvent(a,b,c,d,e)}}else{g=jspoly2tri.sweep.NextFlipPoint(b,c,f,g);jspoly2tri.sweep.FlipScanEdgeEvent(a,b,c,d,f,g);jspoly2tri.sweep.EdgeEvent(a,b,c,d,e)}};
jspoly2tri.sweep.NextFlipTriangle=function(a,b,c,d,e,f){if(b==jspoly2tri.Orientation.CCW){b=d.EdgeIndex(e,f);d.delaunay_edge[b]=true;jspoly2tri.sweep.Legalize(a,d);d.ClearDelunayEdges();return c}b=c.EdgeIndex(e,f);c.delaunay_edge[b]=true;jspoly2tri.sweep.Legalize(a,c);c.ClearDelunayEdges();return d};
jspoly2tri.sweep.NextFlipPoint=function(a,b,c,d){a=jspoly2tri.Orient2d(b,d,a);if(a==jspoly2tri.Orientation.CW)return c.PointCCW(d);else if(a==jspoly2tri.Orientation.CCW)return c.PointCW(d);else throw"[Unsupported] jspoly2tri.sweep.NextFlipPoint: opposing point on constrained edge!";};
jspoly2tri.sweep.FlipScanEdgeEvent=function(a,b,c,d,e,f){var g=e.NeighborAcross(f);if(g==null)throw"[BUG:FIXME] FLIP failed due to missing triangle";e=g.OppositePoint(e,f);if(jspoly2tri.InScanArea(c,d.PointCCW(c),d.PointCW(c),e))jspoly2tri.sweep.FlipEdgeEvent(a,c,e,g,e);else{e=jspoly2tri.sweep.NextFlipPoint(b,c,g,e);jspoly2tri.sweep.FlipScanEdgeEvent(a,b,c,d,g,e)}};



/*
    json2.js
    2013-05-26

    Public Domain.

    NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

    See http://www.JSON.org/js.html


    This code should be minified before deployment.
    See http://javascript.crockford.com/jsmin.html

    USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
    NOT CONTROL.


    This file creates a global JSON object containing two methods: stringify
    and parse.

        JSON.stringify(value, replacer, space)
            value       any JavaScript value, usually an object or array.

            replacer    an optional parameter that determines how object
                        values are stringified for objects. It can be a
                        function or an array of strings.

            space       an optional parameter that specifies the indentation
                        of nested structures. If it is omitted, the text will
                        be packed without extra whitespace. If it is a number,
                        it will specify the number of spaces to indent at each
                        level. If it is a string (such as '\t' or '&nbsp;'),
                        it contains the characters used to indent at each level.

            This method produces a JSON text from a JavaScript value.

            When an object value is found, if the object contains a toJSON
            method, its toJSON method will be called and the result will be
            stringified. A toJSON method does not serialize: it returns the
            value represented by the name/value pair that should be serialized,
            or undefined if nothing should be serialized. The toJSON method
            will be passed the key associated with the value, and this will be
            bound to the value

            For example, this would serialize Dates as ISO strings.

                Date.prototype.toJSON = function (key) {
                    function f(n) {
                        // Format integers to have at least two digits.
                        return n < 10 ? '0' + n : n;
                    }

                    return this.getUTCFullYear()   + '-' +
                         f(this.getUTCMonth() + 1) + '-' +
                         f(this.getUTCDate())      + 'T' +
                         f(this.getUTCHours())     + ':' +
                         f(this.getUTCMinutes())   + ':' +
                         f(this.getUTCSeconds())   + 'Z';
                };

            You can provide an optional replacer method. It will be passed the
            key and value of each member, with this bound to the containing
            object. The value that is returned from your method will be
            serialized. If your method returns undefined, then the member will
            be excluded from the serialization.

            If the replacer parameter is an array of strings, then it will be
            used to select the members to be serialized. It filters the results
            such that only members with keys listed in the replacer array are
            stringified.

            Values that do not have JSON representations, such as undefined or
            functions, will not be serialized. Such values in objects will be
            dropped; in arrays they will be replaced with null. You can use
            a replacer function to replace those with JSON values.
            JSON.stringify(undefined) returns undefined.

            The optional space parameter produces a stringification of the
            value that is filled with line breaks and indentation to make it
            easier to read.

            If the space parameter is a non-empty string, then that string will
            be used for indentation. If the space parameter is a number, then
            the indentation will be that many spaces.

            Example:

            text = JSON.stringify(['e', {pluribus: 'unum'}]);
            // text is '["e",{"pluribus":"unum"}]'


            text = JSON.stringify(['e', {pluribus: 'unum'}], null, '\t');
            // text is '[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]'

            text = JSON.stringify([new Date()], function (key, value) {
                return this[key] instanceof Date ?
                    'Date(' + this[key] + ')' : value;
            });
            // text is '["Date(---current time---)"]'


        JSON.parse(text, reviver)
            This method parses a JSON text to produce an object or array.
            It can throw a SyntaxError exception.

            The optional reviver parameter is a function that can filter and
            transform the results. It receives each of the keys and values,
            and its return value is used instead of the original value.
            If it returns what it received, then the structure is not modified.
            If it returns undefined then the member is deleted.

            Example:

            // Parse the text. Values that look like ISO date strings will
            // be converted to Date objects.

            myData = JSON.parse(text, function (key, value) {
                var a;
                if (typeof value === 'string') {
                    a =
/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
                    if (a) {
                        return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
                            +a[5], +a[6]));
                    }
                }
                return value;
            });

            myData = JSON.parse('["Date(09/09/2001)"]', function (key, value) {
                var d;
                if (typeof value === 'string' &&
                        value.slice(0, 5) === 'Date(' &&
                        value.slice(-1) === ')') {
                    d = new Date(value.slice(5, -1));
                    if (d) {
                        return d;
                    }
                }
                return value;
            });


    This is a reference implementation. You are free to copy, modify, or
    redistribute.
*/

/*jslint evil: true, regexp: true */

/*members "", "\b", "\t", "\n", "\f", "\r", "\"", JSON, "\\", apply,
    call, charCodeAt, getUTCDate, getUTCFullYear, getUTCHours,
    getUTCMinutes, getUTCMonth, getUTCSeconds, hasOwnProperty, join,
    lastIndex, length, parse, prototype, push, replace, slice, stringify,
    test, toJSON, toString, valueOf
*/


// Create a JSON object only if one does not already exist. We create the
// methods in a closure to avoid creating global variables.

if (typeof JSON !== 'object') {
    JSON = {};
}

(function () {
    'use strict';

    function f(n) {
        // Format integers to have at least two digits.
        return n < 10 ? '0' + n : n;
    }

    if (typeof Date.prototype.toJSON !== 'function') {

        Date.prototype.toJSON = function () {

            return isFinite(this.valueOf())
                ? this.getUTCFullYear()     + '-' +
                    f(this.getUTCMonth() + 1) + '-' +
                    f(this.getUTCDate())      + 'T' +
                    f(this.getUTCHours())     + ':' +
                    f(this.getUTCMinutes())   + ':' +
                    f(this.getUTCSeconds())   + 'Z'
                : null;
        };

        String.prototype.toJSON      =
            Number.prototype.toJSON  =
            Boolean.prototype.toJSON = function () {
                return this.valueOf();
            };
    }

    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        gap,
        indent,
        meta = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        },
        rep;


    function quote(string) {

// If the string contains no control characters, no quote characters, and no
// backslash characters, then we can safely slap some quotes around it.
// Otherwise we must also replace the offending characters with safe escape
// sequences.

        escapable.lastIndex = 0;
        return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
            var c = meta[a];
            return typeof c === 'string'
                ? c
                : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
        }) + '"' : '"' + string + '"';
    }


    function str(key, holder) {

// Produce a string from holder[key].

        var i,          // The loop counter.
            k,          // The member key.
            v,          // The member value.
            length,
            mind = gap,
            partial,
            value = holder[key];

// If the value has a toJSON method, call it to obtain a replacement value.

        if (value && typeof value === 'object' &&
                typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }

// If we were called with a replacer function, then call the replacer to
// obtain a replacement value.

        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }

// What happens next depends on the value's type.

        switch (typeof value) {
        case 'string':
            return quote(value);

        case 'number':

// JSON numbers must be finite. Encode non-finite numbers as null.

            return isFinite(value) ? String(value) : 'null';

        case 'boolean':
        case 'null':

// If the value is a boolean or null, convert it to a string. Note:
// typeof null does not produce 'null'. The case is included here in
// the remote chance that this gets fixed someday.

            return String(value);

// If the type is 'object', we might be dealing with an object or an array or
// null.

        case 'object':

// Due to a specification blunder in ECMAScript, typeof null is 'object',
// so watch out for that case.

            if (!value) {
                return 'null';
            }

// Make an array to hold the partial results of stringifying this object value.

            gap += indent;
            partial = [];

// Is the value an array?

            if (Object.prototype.toString.apply(value) === '[object Array]') {

// The value is an array. Stringify every element. Use null as a placeholder
// for non-JSON values.

                length = value.length;
                for (i = 0; i < length; i += 1) {
                    partial[i] = str(i, value) || 'null';
                }

// Join all of the elements together, separated with commas, and wrap them in
// brackets.

                v = partial.length === 0
                    ? '[]'
                    : gap
                    ? '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']'
                    : '[' + partial.join(',') + ']';
                gap = mind;
                return v;
            }

// If the replacer is an array, use it to select the members to be stringified.

            if (rep && typeof rep === 'object') {
                length = rep.length;
                for (i = 0; i < length; i += 1) {
                    if (typeof rep[i] === 'string') {
                        k = rep[i];
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            } else {

// Otherwise, iterate through all of the keys in the object.

                for (k in value) {
                    if (Object.prototype.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            }

// Join all of the member texts together, separated with commas,
// and wrap them in braces.

            v = partial.length === 0
                ? '{}'
                : gap
                ? '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}'
                : '{' + partial.join(',') + '}';
            gap = mind;
            return v;
        }
    }

// If the JSON object does not yet have a stringify method, give it one.

    if (typeof JSON.stringify !== 'function') {
        JSON.stringify = function (value, replacer, space) {

// The stringify method takes a value and an optional replacer, and an optional
// space parameter, and returns a JSON text. The replacer can be a function
// that can replace values, or an array of strings that will select the keys.
// A default replacer method can be provided. Use of the space parameter can
// produce text that is more easily readable.

            var i;
            gap = '';
            indent = '';

// If the space parameter is a number, make an indent string containing that
// many spaces.

            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }

// If the space parameter is a string, it will be used as the indent string.

            } else if (typeof space === 'string') {
                indent = space;
            }

// If there is a replacer, it must be a function or an array.
// Otherwise, throw an error.

            rep = replacer;
            if (replacer && typeof replacer !== 'function' &&
                    (typeof replacer !== 'object' ||
                    typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }

// Make a fake root object containing our value under the key of ''.
// Return the result of stringifying the value.

            return str('', {'': value});
        };
    }


// If the JSON object does not yet have a parse method, give it one.

    if (typeof JSON.parse !== 'function') {
        JSON.parse = function (text, reviver) {

// The parse method takes a text and an optional reviver function, and returns
// a JavaScript value if the text is a valid JSON text.

            var j;

            function walk(holder, key) {

// The walk method is used to recursively walk the resulting structure so
// that modifications can be made.

                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }


// Parsing happens in four stages. In the first stage, we replace certain
// Unicode characters with escape sequences. JavaScript handles many characters
// incorrectly, either silently deleting them, or treating them as line endings.

            text = String(text);
            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function (a) {
                    return '\\u' +
                        ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }

// In the second stage, we run the text against regular expressions that look
// for non-JSON patterns. We are especially concerned with '()' and 'new'
// because they can cause invocation, and '=' because it can cause mutation.
// But just to be safe, we want to reject all unexpected forms.

// We split the second stage into 4 regexp operations in order to work around
// crippling inefficiencies in IE's and Safari's regexp engines. First we
// replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
// replace all simple value tokens with ']' characters. Third, we delete all
// open brackets that follow a colon or comma or that begin the text. Finally,
// we look to see that the remaining characters are only whitespace or ']' or
// ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

            if (/^[\],:{}\s]*$/
                    .test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
                        .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
                        .replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

// In the third stage we use the eval function to compile the text into a
// JavaScript structure. The '{' operator is subject to a syntactic ambiguity
// in JavaScript: it can begin a block or an object literal. We wrap the text
// in parens to eliminate the ambiguity.

                j = eval('(' + text + ')');

// In the optional fourth stage, we recursively walk the new structure, passing
// each name/value pair to a reviver function for possible transformation.

                return typeof reviver === 'function'
                    ? walk({'': j}, '')
                    : j;
            }

// If the text is not JSON parseable, then a SyntaxError is thrown.

            throw new SyntaxError('JSON.parse');
        };
    }
}());


/**
INDOOR.JS
*/

/**
The MIT License (MIT)

Copyright (c) 2013 Whatamap.com Ltd

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

// mapbox.js and Leaflet should be defined prior to running this code
// here, let's define L.indoor property
L.indoor = 
 {  
  latLng: function(lat, lng, level) {
    var latLng = new L.LatLng(lat, lng);
    latLng.level = level;
    return latLng;
  },
  map: function(element, _, options, callback) {
    if(!options) options = {};

    // initialize internal variables
    var levelControl = _.levelControl == undefined? true : _.levelControl;
    var currentLevel = undefined; 
    var levels = {};
    var levelIndex = {};
    var targetLevel = undefined;
    var levelCount = 0;
    var initialCenterSet = false;
    var _level = 0;
    var markerStyleFunction = undefined;
    var mapInstanceId = parseInt(Math.random()*Math.pow(10, 10));
    var highlightCount = 0;
    var levelControlSet = false;
    var georeferences = [];
    var project = null;

    // this object holds 
    // features: the features and their highlight styles
    // polygons: the actual Leaflet polygon objects that are shown on the map
    var highlights = {
      polygons: {}, 
      features : {}
    }

    var virtualCoordinates = false;

    // this code hides the map for a fade-in effect while having a constant layout during the map load
    var mapDiv = $(document.getElementById(element));
    mapDiv.css('opacity', 0.00001);
    var map = new L.mapbox.map(element, undefined, options);

    map.enableStreetMap = function() {
      // having an empty function here to improve backwards compatibility
      // please add a separate street map layer manually if you wish
    }

    map.disableStreetMap = function() {
      // having an empty function here to improve backwards compatibility
      // please add a separate street map layer manually if you wish
    }

    // this is the search function of indoor.js
    map.getFeaturesAsync = function(arg1, callback) {
      // if there's no callback function, this is meaningless, so return
      if(!callback) return [];

      // otherwise, do a search (an ajax call)
      search(null, arg1, function(error, data) {
        if(error != null) {
	  // an error occurred, pass it to the callback and return an empty array for coding convenience
	  callback(error, []);
	  return;
        }
        
	// search was ok and we may have some map features here
	for(var i in data.features) {
	  var feature = data.features[i];
	  
	  // swap level properties so that 
	  // feature.levelIndex == the technical array index of the level in the array of levels, beginning with 0
	  // feature.properties.level == the name of the level, to be used whenever you need to display a level name
	  feature.levelIndex = data.features[i].properties.level;
	  feature.properties.level = levelIndex[feature.levelIndex].name;

	  // if the feature is a polygon, it is an area in the indoor.io tool
	  if(feature.geometry.type == 'Polygon') {
	   
	    // convert every coordinate pair to an L.indoor.latLng object
	    for(var j in data.features[i].geometry.coordinates) {
	      var polygon = data.features[i].geometry.coordinates[j];
	      for(var p in polygon) {
	        polygon[p] = new L.indoor.latLng(polygon[p][1], polygon[p][0], data.features[i].properties.level);
	      }
	    }

	    // if a "reference location" is defined, redefine it as feature.properties.markerLocation of type L.indoor.latLng
	    if(feature.properties['_referenceLocation']) {
	      var ref_loc = feature.properties['_referenceLocation'].split(',');
	      delete feature.properties['_referenceLocation'];
	      feature.properties.markerLocation = new L.indoor.latLng(ref_loc[1], ref_loc[0], feature.properties.level);
	    }

	  // if the feature is a point, it is a single vertex in the indoor.io tool
	  } else if(feature.geometry.type == 'Point') {
	    feature.properties.markerLocation = new L.indoor.latLng(
	      feature.geometry.coordinates[1], 
	      feature.geometry.coordinates[0],
	      feature.properties.level);
	  }
	
  	  map.addFeaturesToIdIndex(data.features[i]);
	}
	
	// we have now preprocessed the resulting features; let's pass it to the listener
	callback(null, data.features);
      });
      // for not crashing apps that used the older, synchronic version, return an empty array
      return [];
    }

    map.addFeaturesToIdIndex = function(features) {
      if(typeof features != 'array') features = [features];
 
       for(var i in features) {
	  var feature = features[i];
          if(feature.properties['_featureIdentifier']) {
            feature.properties['featureIdentifier'] = feature.properties['_featureIdentifier'];
   	    delete feature.properties['_featureIdentifier'];
	  } else {
	    feature.properties.featureIdentifier = parseInt(Math.random()*Math.pow(10, 10));
	  }
	  featuresById[feature.properties.featureIdentifier] = feature;
       }
    }

    // having this wrapper function to improve backwards compatibility (to avoid crashes)   
    map.getFeatures = function(arg1, arg2, arg3) {
      if(arg2 && typeof arg2 == 'function') {
        map.getFeaturesAsync(arg1, arg2);
	return;
      }
    }

    // center and zoom the view so that the given features are visible (if on the current floor!)
    map.fitFeatures = function(feature) {
      var _features;
      if(feature.geometry) _features = [feature];
      else _features = feature;

      // TODO: add here a loop to build a bounding box of all given features
      // TODO: now only using the first feature

      map.fitBounds(_features[0].geometry.coordinates);
      map.setLevel(_features[0].properties.level);
    }

    map.clearHighlight = function(highlight) {
      var id = typeof highlight == 'string'? highlight : highlight.id;

      if(highlights.features[id]) delete highlights.features[id];
      updateFeatures();
    }

    // this function features the given feature(s) with the given style (L.Path style)
    map.highlightFeatures = function(area, style) {
      // for developer convenience; if the clickable property is not given, default it to false (opposed to the default true value in Leaflet)
      if(style.clickable == undefined) style.clickable = false;

      // count the done highlights in order to provide an easy integer identifier to them
      highlightCount++;
      var id = highlightCount;

      // append the to-be-highlighted features to the highlights.features property
      highlights.features[id] = {id: id, feature: area, style: style};      

      // call updateFeatures, which causes the highlights to be asynchronously refreshed
      updateFeatures();
  
      // return the highlight object, including the id property that may be used in future
      return highlights.features[id];
    }

    // this function removes all polygon/point highlights
    map.clearHighlights = function() {
      removeHighlightPolygons();
      highlights.features = {};
    }

    // TODO: update this function to be 100% local, based on the georeferencing of the indoor map
    // TODO: make the georeferencing points available here
    map.convertLatLng = function(latLng, callback) {
      if(virtualCoordinates) {
        var maxc = 20037508.34;
        var newCoords = L.indoor.coordinates.WGS84ToLocal(latLng.lat, latLng.lng, georeferences[0], georeferences[1]);
	var bbox = project.boundingBox;
 	var rbbox = project.rotatedBoundingBox;
	var angle = project.rotation;

	var centerVector = {x: newCoords.x-(bbox.maxx+bbox.minx)/2, 
			    y: newCoords.y-(bbox.maxy+bbox.miny)/2};
	var rotatedCenterVector = IMath.rotateCCW(angle, centerVector);
					    
	newCoords = {x: -rbbox.minx+(bbox.maxx+bbox.minx)/2+rotatedCenterVector.x,
		     y: -rbbox.miny+(bbox.maxy+bbox.miny)/2+rotatedCenterVector.y,
		     z: 0};

	newCoords = {lon: (newCoords.x/maxc)*180, lat: (newCoords.y/maxc)*180};
	callback(null, new L.LatLng(newCoords.lat, newCoords.lon));
      }
      else callback(null, new L.LatLng(latLng.lat, latLng.lng));
    }
    var maxc = 20037508.34;

    map.convertXyToLocalLatLng = function(x, y) {
	var bbox = project.boundingBox;
 	var rbbox = project.rotatedBoundingBox;
	var angle = project.rotation;
    
	var centerVector = {x: newCoords.x-(bbox.maxx+bbox.minx)/2, 
			    y: newCoords.y-(bbox.maxy+bbox.miny)/2};


      var rbbox = project.rotatedBoundingBox;
    }

    map.convertUpsideDownXyToLocalLatLng = function(x, y) {
      return {lat: mapBounds.getNorthWest().lat - y/maxc*180, lng: x/maxc*180};
    }
    

    map.convertLocalLatLngToXy = function(latLng) {
	var bbox = project.boundingBox;
 	var rbbox = project.rotatedBoundingBox;
	var angle = project.rotation;

	var newCoords = {x: rbbox.minx+latLng.lng/180*maxc, y: rbbox.miny+latLng.lat/180*maxc};
	
	var centerVector = {x: newCoords.x-(bbox.maxx+bbox.minx)/2, 
			    y: newCoords.y-(bbox.maxy+bbox.miny)/2};
	var rotatedCenterVector = IMath.rotateCCW(-angle, centerVector);
					    
	newCoords = {x: (bbox.maxx+bbox.minx)/2+rotatedCenterVector.x,
		     y: (bbox.maxy+bbox.miny)/2+rotatedCenterVector.y,
		     z: 0};
	return newCoords;


    }

    map.convertLocalLatLngToXy2 = function(latLng) {
	var bbox = project.boundingBox;
 	var rbbox = project.rotatedBoundingBox;
	var angle = project.rotation-90;

	var newCoords = {x: rbbox.minx+latLng.lng/180*maxc, y: rbbox.miny+latLng.lat/180*maxc};
	
	var centerVector = {x: newCoords.x-(bbox.maxx+bbox.minx)/2, 
			    y: newCoords.y-(bbox.maxy+bbox.miny)/2};
	var rotatedCenterVector = IMath.rotateCCW(-angle, centerVector);
					    
	newCoords = {x: (bbox.maxx+bbox.minx)/2+rotatedCenterVector.x,
		     y: (bbox.maxy+bbox.miny)/2+rotatedCenterVector.y,
		     z: 0};
	return newCoords;


    }

    map.convertLocalLatLngToStandardXy = function(latLng, callback) {

    }

    map.convertLocalLatLngToWGS84 = function(latLng, callback) {
      if(virtualCoordinates) {
	var coords = map.convertLocalLatLngToXy(latLng);
        callback(null, L.indoor.coordinates.localToWGS84(coords.x, coords.y, georeferences[0], georeferences[1]));
      }
      else callback(null, new L.LatLng(latLng.lat, latLng.lng));
    }

    function removeHighlightPolygons() {
      for(var i in highlights.polygons) {
        for(var p in highlights.polygons[i]) {
	  if(map.hasLayer(highlights.polygons[i][p].polygon)) map.removeLayer(highlights.polygons[i][p].polygon);
	}  
      }
      highlights.polygons = {};
    }

    // this function sets a timer to run _updateFeatures function; this is done this way to avoid 
    // sequential feature updates from for loops etc.  
    function updateFeatures() {
      if(window.updateFeaturesTimer) clearTimeout(window.updateFeaturesTimer);
      window.updateFeaturesTimer = setTimeout(_updateFeatures, 1);
    }

    // this is the real operational function to update the highlighted features
    function _updateFeatures() {
      // this function hides those layers that aren't on the current level
      _updateLayers();

      removeHighlightPolygons();

      // this for loop goes through every highlight definition.
      // if there are features to be shown on the current level, show them; else, don't.
      for(var area in highlights.features) {
	var highlight = highlights.features[area];
        var feature = highlight.feature;
	
	// convert the feature var to an array, if it wasn't already
	var _features = [];
 	if(feature.geometry) _features.push(feature);
	else _features = feature;

	// then loop the array
	for(var i=0;i<_features.length;i++) {
          var polygon = new L.Polygon(_features[i].geometry.coordinates, highlight.style);
	  if(_features[i].levelIndex == currentLevel.levelIndex) {
	    map.__indoor_addLayer(polygon); 
	    polygon.bringToFront();
	  } else {
	  }
          if(!highlights.polygons[currentLevel.levelIndex]) highlights.polygons[currentLevel.levelIndex] = [];
          highlights.polygons[currentLevel.levelIndex].push({feature: _features[i], polygon: polygon});
	}
      }
    }

    function _setLevel(level) {
      // ok, update the internal _level var now
      _level = level;

      // if we're already on a level, hide it!
      if(currentLevel) {
        map.removeLayer(currentLevel.tileLayer);
	map.removeLayer(currentLevel.gridLayer);
	if(currentLevel.markerLayer && map.hasLayer(currentLevel.markerLayer)) map.removeLayer(currentLevel.markerLayer);
      }
 
      // if there's a default level chooser element, update it accordingly
      $('#level_chooser a').attr('class', '');
      $('#level_chooser a[level='+level+']').attr('class', 'leaflet-disabled');

      // define tile and grid layers 
      var tileLayer = L.mapbox.tileLayer(levels[level]);
      map.addLayer(tileLayer);
      var gridLayer = L.mapbox.gridLayer(levels[level]);
      map.addLayer(gridLayer);

      // add a grid control to enable click and hover events
      map.addControl(L.indoor.gridControl(gridLayer, {click: _.click, hover: _.hover}));

      // store the layer objects
      levels[level].gridLayer = gridLayer;
      levels[level].tileLayer = tileLayer;
      currentLevel = levels[level];

      // update features == hide features that are not on this level; show those that are     
      updateFeatures();

      // if there are routes shown, update them as well
      updateRoutes();

      // return the map object for coding convenience
      return map;
    }

    // this internal function loops through the leaflet layers and hides those layers that have a level definition that is not the current level
    function _updateLayers() {
      for(var i in map._layers) {
	if(map._layers[i]._latlng) {
	  if(map._layers[i]._latlng.level) {
	    if(map._layers[i]._latlng.level == map.getLevel()) {
	      if(map._layers[i].setOpacity) {
	        map._layers[i].setOpacity(1);
	      } else if(map._layers[i]._container) {
	        $(map._layers[i]._container).show();
	      }
            } else {
	      if(map._layers[i].setOpacity) {
	        map._layers[i].setOpacity(0);
	      } else if(map._layers[i]._container) {
	        $(map._layers[i]._container).hide();
	      }
	    }
	  }
	}
      }
    }

    map.getLevels = function() {
      var levelArray = [];
      for(var i in levels) levelArray.push(i);
      return levelArray;
    }

    function getLevelIndex() {
      return currentLevel.levelIndex;
    }

    map.getLevel = function() {
      return _level;
    }     

    // this function changes the shown indoor level. If the initialization is still ongoing, save the desired level and show it later
    map.setLevel = function(level) {
      if(levels[level] != undefined) {
        _setLevel(level);
      } else {
        targetLevel = level;
      }
    };
    
    // this function shows or hides the default level control.
    map.toggleLevelControl = function(flag) {
	    if( levelControl != flag || !levelControlSet ) {
		levelControlSet = true;
		if( flag ) {
		    var level_chooser = $(document.getElementById(element))
			.find(".leaflet-top.leaflet-left .level_chooser[mapInstanceId="+mapInstanceId+"]");
	    	    if(level_chooser.length > 0) 
			level_chooser.remove();
		    else 
			$(document.getElementById(element))
			.find(".leaflet-top.leaflet-left")
			.append('<div id="level_chooser_title" class="level_chooser_title" mapInstanceId="'+mapInstanceId+'" style="font-weight: bold; font-size: 13px; color: #444; text-shadow: 0px 1px 0px white; ' + 
				'margin-left: 10px; margin-top: 10px; margin-bottom: -8px;">Levels</div>');
		    $(document.getElementById(element))
			.find(".leaflet-top.leaflet-left")
			.append('<div class="leaflet-bar level_chooser leaflet-control" mapInstanceId="'+mapInstanceId+'" id="level_chooser"></div>');
		    
		    for(var j=0;j<loadedLevels.length;j++) {
			$('.level_chooser[mapInstanceId='+mapInstanceId+']')
			    .append('<a onmousemove="if(!event) event=window.event;' + 
				    'if( event.cancelBubble ) event.cancelBubble = true;' +
				    'if( event.stopPropagation ) event.stopPropagation(); ' + 
				    'if( event.preventDefault ) event.preventDefault();" ' + 
				    'onclick="if(!event) event = window.event; ' +
				    'if( event.cancelBubble ) event.cancelBubble = true;' +
				    'if( event.stopPropagation ) event.stopPropagation();' + 
				    'if( event.preventDefault ) event.preventDefault();' +
				    'map.setLevel(\'' + loadedLevels[j] + '\');" ' + 
				    'style="font-weight: bold; cursor: hand; text-decoration: none;" ' + 
				    'level="' + loadedLevels[j] + '">' + loadedLevels[j] + '</a>');
		    }
		} else {
		    $('.level_chooser[mapInstanceId='+mapInstanceId+']').remove();
		    $('.level_chooser_title[mapInstanceId'+mapInstanceId+']').remove();
		}
	    }

	    levelControl = flag;
    }
	

    var routingId = null;
    var shownRoutes = {};
    var markerFilterFunction = null;

    map.showRoute = function(route, options) {
      options = options?options:{};
      
      if(!options.color) options.color = '#000';
      
      var lines = { levels: {} };
      for(var i in levels) lines.levels[levels[i].levelIndex] = {polyline: null, points: []};


      var currentLine = [];
      var first = false;
      var last = undefined;
      for(var i=0;i<route.length;i++) {
	last = route[i];
        if(!first) {
 	  first = route[i];
	}
	if(route[i].l != undefined) route[i].level = route[i].l;

	if(currentLine.length == 0) {
  	  currentLine.push(route[i]);
	} else {
	  if(currentLine[currentLine.length-1].levelIndex == route[i].levelIndex) {
	    currentLine.push(route[i]);
   	} else {
            currentLine.push(route[i]);
	    lines.levels[currentLine[0].levelIndex].points.push(currentLine);
	    currentLine = [route[i]];
	  }	
	}
      }
      if(currentLine.length > 1) {
	lines.levels[currentLine[0].levelIndex].points.push(currentLine);
      } 


      var id = Math.floor(Math.random()*Math.pow(10, 10));      

      for(var i in lines.levels) {
        lines.levels[i].polyline = new L.MultiPolyline(lines.levels[i].points, options.lineOptions?options.lineOptions:{});
      }
      if(route.length > 1) {
        var properties = undefined; 
        if(options.startIcon) properties = {icon: options.startIcon};
        lines.startMarker = new L.marker(new L.LatLng(first.lat, first.lng), properties);
        if(!options.startIcon) lines.startMarker.setOpacity(0);

   	properties = undefined;
	if(options.endIcon) properties = {icon: options.endIcon};
        lines.endMarker = new L.marker(new L.LatLng(last.lat, last.lng), properties);
        if(!options.endIcon) lines.endMarker.setOpacity(0);
      }
      shownRoutes[id] = lines;
      shownRoutes[id].options = options;
      shownRoutes[id].status = {};
      shownRoutes[id].data = route;
      updateRoutes();
      if(shownRoutes[id].options.animate) animateRoute(shownRoutes[id]);

      return id;
    }

    function updateRoutes() {
      for(var i in shownRoutes) {
        if(!shownRoutes[i]) continue;
        for(var l in shownRoutes[i].levels) {
          if(map.hasLayer(shownRoutes[i].levels[l].polyline)) map.removeLayer(shownRoutes[i].levels[l].polyline);
	}
        if(map.hasLayer(shownRoutes[i].startMarker)) map.removeLayer(shownRoutes[i].startMarker);
        if(map.hasLayer(shownRoutes[i].endMarker)) map.removeLayer(shownRoutes[i].endMarker);

	if(shownRoutes[i].data.length > 0) {
          if(shownRoutes[i].levels[getLevelIndex()].polyline) map.addLayer(shownRoutes[i].levels[getLevelIndex()].polyline);
	  if(shownRoutes[i].data[0].levelIndex == getLevelIndex())
 	    map.addLayer(shownRoutes[i].startMarker);
	  if(shownRoutes[i].data[shownRoutes[i].data.length-1].levelIndex == getLevelIndex())
            map.addLayer(shownRoutes[i].endMarker);
        }
      }
    }

    map.hideRoute = function(route) {
      if(shownRoutes[route] != undefined) {
      for(var i in shownRoutes[route].levels) {
        if(shownRoutes[route].levels[i].polyline && map.hasLayer(shownRoutes[route].levels[i].polyline)) map.removeLayer(shownRoutes[route].levels[i].polyline); 
      }
      if(shownRoutes[route].startMarker && map.hasLayer(shownRoutes[route].startMarker)) map.removeLayer(shownRoutes[route].startMarker); 
      if(shownRoutes[route].endMarker && map.hasLayer(shownRoutes[route].endMarker)) map.removeLayer(shownRoutes[route].endMarker); 
      if(shownRoutes[route].headMarker && map.hasLayer(shownRoutes[route].headMarker)) map.removeLayer(shownRoutes[route].headMarker);
      shownRoutes[route].status.animationProgress = shownRoutes[route].status.animationMax;
      shownRoutes[route] = undefined;
      }
    }

    function animateRoute(route) {
      if(route.data.length == 0) return;
      if(!route.options.animateIcon) route.options.animateIcon = new L.divIcon({html: 'X'});
      if(!route.headMarker && route.data.length > 0) {
	route.headMarker = new L.marker(new L.LatLng(route.data[0].lat, route.data[0].lng), {icon: route.options.animateIcon});
      }

      if(route.status.animationProgress == undefined) route.status.animationProgress = 0;

      if(!route.totalLength) {
        route.totalLength = 0;
	for(var p=0;p<route.data.length-1;p++) {
	  route.data[p].distanceToNext = Math.sqrt(Math.pow(route.data[p].lat-route.data[p+1].lat, 2)+Math.pow(route.data[p].lng-route.data[p+1].lng, 2));
	  route.data[p].totalDistanceToThis = route.totalLength;
   	  route.totalLength += route.data[p].distanceToNext;
	}
	route.data[route.data.length-1].totalDistanceToThis = route.totalLength;
	route.data[route.data.length-1].distanceToNext = -1;

	var refDistance = 0.0005640361071184976;
	var refCount = 60;
	route.status.animationMax = route.totalLength/refDistance*refCount;

	route.animationPoints = [];
	var animationUnit = route.totalLength/(route.status.animationMax-1);
	
	for(var i=0;i<route.status.animationMax;i++) {
	  var ometer = i*animationUnit; 
	  var previousPoint = route.data[0];
	  var nextPoint = route.data[0];
	  for(var p=0;p<route.data.length-1 && route.data[p].totalDistanceToThis<ometer;p++) {
	    previousPoint = nextPoint;
	    nextPoint = route.data[p+1];
	  }
 
	  if(previousPoint == nextPoint) 
	    route.animationPoints.push(previousPoint);
	  else {
	    var distanceLeft = ometer-previousPoint.totalDistanceToThis;
	    var relDistance = distanceLeft/previousPoint.distanceToNext;
	    route.animationPoints.push({lat: previousPoint.lat+relDistance*(nextPoint.lat-previousPoint.lat), lng: previousPoint.lng+relDistance*(nextPoint.lng-previousPoint.lng), level: previousPoint.level});
	  }
	}
      }
      var levelChangeDelay = 1000;
      var levelChangeFactor = 0;
      if(route.status.animationProgress >= route.status.animationMax) {
        route.animationComplete = true;
	route.status.animationProgress = undefined;
	if(map.hasLayer(route.headMarker)) 
	  map.removeLayer(route.headMarker);
      } else {
        // animation here
        if(!map.hasLayer(route.headMarker)) map.addLayer(route.headMarker);
 	var latLng = new L.LatLng(route.animationPoints[route.status.animationProgress].lat, route.animationPoints[route.status.animationProgress].lng);
        route.headMarker.setLatLng(latLng);
	map.panTo(latLng);
	if(map.getLevel() != route.animationPoints[route.status.animationProgress].level) {
  	  map.setLevel(route.animationPoints[route.status.animationProgress].level);
	  levelChangeFactor = 1;
	}
      }
  
      if(!route.animationComplete) {
	route.status.animationProgress = Math.min(route.status.animationProgress+1, route.status.animationMax);
	setTimeout(function() { animateRoute(route); }, 1000/15+levelChangeDelay*levelChangeFactor);
      } 
    }

    map.__indoor_addLayer = map.addLayer;
    map.addLayer = function(layer) {
      map.__indoor_addLayer(layer);
      updateFeatures();
    }

    var featuresById = {};

    map.getFeatureById = function(id) {
      return featuresById[id];     
      for(var i in levels)
	if(levels[i].geojson.index[id]) return levels[i].geojson.index[id];
      return null;
    }

    map.getFeaturesAt = function(latLng) {
      var results = [];
      return results;
    }

    map.getRoute = function(a, b, callback) {
      if(!routingId) callback('Routing not enabled on the specified map.');

      // this hassle makes sure that coordinates do have lat, lng == lon, and level properties.
      // the experience is that they are not always properly defined.  
      if(!a.level && a.l) a.level = a.l;
      if(!a.l && a.level) a.l = a.level;
      if(!b.level && b.l) b.level = b.l;
      if(!b.l && b.level) b.l = b.level;
      if(!a.lng && a.lon) a.lng = a.lon;
      if(!a.lon && a.lng) a.lon = a.lng;
      if(!b.lng && b.lon) b.lng = b.lon;
      if(!b.lon && b.lng) b.lon = b.lng;

      var p1 = null;
      var p2 = null; 

      p1 = {lat: b.lat, lng: b.lng, lon: b.lon, level: b.level, l: b.l};
      p2 = {lat: a.lat, lng: a.lng, lon: a.lon, level: a.level, l: a.l};

      p1.level = p1.l = parseInt(levels[p1.level].levelIndex);
      p2.level = p2.l = parseInt(levels[p2.level].levelIndex);
      $.ajax({
	url: window.location.protocol+'//navi.indoor.io/navi/maps/'+_.project+'/route.jsonp?'+
	  'lat1='+(p1.lat)+'&lon1='+p1.lon+'&level1='+p1.level+
	  '&lat2='+(p2.lat)+'&lon2='+p2.lon+'&level2='+p2.level+
	  '&callback=?',
	dataType: 'jsonp',
        contentType: 'text/json', 
	processData: false, 
	jsonp: 'callback'
      }).done(function(data) {
	var route = [];
	if(!data) {
	  callback('Error in calculating route');
	  return;
	}
	for(var i in data.features) {
	  var feature = data.features[i];
	  for(var c in feature.geometry.coordinates) {
	    route.push({lng: feature.geometry.coordinates[c][0], 
			lat: feature.geometry.coordinates[c][1], 
			level: feature.properties.level});
	  }
	}

	for(var i in route) {
	  for(var l in levels) {
	    if(route[i].level == levels[l].levelIndex) { 
	      route[i].levelIndex = route[i].level;
	      route[i].l = route[i].level = levels[l].name;
	      break;
	    }
	  }	    
	}
	callback(null, route);
      }).fail(function(data) {
          callback('Server or connection problem. Route could not be calculated.');

      });

    }
    function search(mapid, query, callback) {
      function done(errmsg, result) {
        if( callback ) {
          try {
            var cbfun = callback;
            callback = null;
            cbfun(errmsg, result);
          } catch(err) {}
        }
      }

      try {
	var mapid = mapid ? mapid : _.project;
        if( typeof mapid != 'string' ) {
          done('invalid map id');
          return;
        }
        if( typeof query == 'function' ) {
          callbackdone = callback;
          callback = query;
          query = {};
        }

        var str = '';
        function parseQuery(obj, prefix) {
          if( typeof obj == 'object' ) {
            if( obj instanceof RegExp ) {
              if(str.length > 0)
                str += '&';
              str += '.' + prefix + '=' + obj.toString();
            } else
              for( var ai in obj )
                parseQuery(obj[ai],
                           prefix ? prefix + '.' + ai : ai);
          } else if(typeof obj == 'string' ||
                    typeof obj == 'number' ) {
            if(str.length > 0)
              str += '&';
            str += '.' + prefix + '=' + obj;
          }
        }
        
        parseQuery(query, '');

        $.getJSON(window.location.protocol+'//navi.indoor.io/navi/maps/' + _.project +
                  '/search.jsonp?' + str +
                  '&callback=?')
          .fail(function(jqXHR, textStatus, errorThrown) {
            done('error');
          })
          .done(function(data, textStatus, jqXHR) {
             done(null, data)
          });
      } catch(err) {
        done('error making request');
      }
    }


    var loadedLevels = [];

    // this is a helper function to always provide the feature data in a consistent format
    map.parseUTFGridData = function(data) {
      var featureIdentifier = data.id ? data.id : data['_featureIdentifier'];
      var properties = {}
      for(var d in data) {
	if(typeof data[d] == 'string' && data[d].length == 0) continue;
        if(d == 'geometry') continue;
        if(d == '_referenceLocation') {
          var ref_loc = data['_referenceLocation'].split(',');
          properties.markerLocation = new L.LatLng(ref_loc[1], ref_loc[0], "1");
          continue;
        }

        if(d == '_featureIdentifier') {
          properties.featureIdentifier = data['_featureIdentifier'];
          continue;
        }
        properties[d] = data[d];
      }

      var feature = {
        properties: properties, 
        geometry: JSON.parse(data.geometry),
        levelIndex: data.levelIndex ? data.levelIndex : 0
      };
      feature.properties.level = map.getLevels()[feature.levelIndex].name;	
      if(feature.geometry.type == 'Polygon') {
        var coords = feature.geometry.coordinates;
        for(var i in coords)
          for(var j in coords[i]) {
            var coord = coords[i][j];
            coords[i][j] = new L.indoor.latLng(coord[1], coord[0], "1");
          }
      }
      return feature;
    }

    var mapBounds = null;

    // this function is called when we've got a level-specific JSON
    function levelJsonLoaded(data, project, index) {
      if(data.bounds[0] == 0 && data.bounds[1] == 0) {
        virtualCoordinates = true;
      }
      mapBounds = data.bounds;
      levels[data.name] = data;
      levels[data.name].levelIndex = parseInt(index);	
      levelIndex[levels[data.name].levelIndex] = levels[data.name];
      
      loadedLevels[index] = data.name;

      // ok, then, count the levels 
      var levelCount = 0;
      for(var j in levels) {
        levelCount++;
      }
      // if we've loaded all levels, let's go!
      if(levelCount == project.levels.length) { 
        loadedLevels.reverse();
        map.toggleLevelControl(levelControl);

	mapDiv.hide().css('opacity', 1).fadeIn();

	if(targetLevel != undefined && levels[targetLevel]) _setLevel(targetLevel);
        else _setLevel(data.name);

	if(!initialCenterSet) {
	  var bounds = new L.LatLngBounds(
            new L.LatLng(data.bounds[1]-(data.bounds[3]-data.bounds[1])/2,
                         data.bounds[0]-(data.bounds[2]-data.bounds[0])/2),
            new L.LatLng(data.bounds[3]+(data.bounds[3]-data.bounds[1])/2,
                         data.bounds[2]+(data.bounds[2]-data.bounds[0])/2));
	  map.setMaxBounds(bounds);
	  mapBounds = new L.LatLngBounds(
            new L.LatLng(data.bounds[1],
                         data.bounds[0]),
            new L.LatLng(data.bounds[3], 
                         data.bounds[2]));
	  map.fitBounds(mapBounds);

	  map.addEventListener('moveend', function(e) {
	    var tl = mapBounds.getNorthWest();
	    var br = mapBounds.getSouthEast();
	    var mapCenter = map.getCenter();
	    var targetLatLng = new L.LatLng(mapCenter.lat, mapCenter.lng);
	    if(mapCenter.lat < br.lat) targetLatLng.lat = br.lat;
	    if(mapCenter.lat > tl.lat) targetLatLng.lat = tl.lat;
	    if(mapCenter.lng < tl.lng) targetLatLng.lng = tl.lng;
	    if(mapCenter.lng > br.lng) targetLatLng.lng = br.lng;
	    if(mapCenter.lat != targetLatLng.lat || mapCenter.lng != targetLatLng.lng) {
	      map.panTo(targetLatLng);
	    }
	  });
	  initialCenterSet = true;
	}
	if(callback) {
          callback(_.project, element);
	}
      }
    }

   

    // this function causes a level-specific JSON to be loaded
    function levelLoadFunction(project, i) {
      return function() {
 	loadedLevels.push({});
        $.ajax({
            dataType: 'jsonp',
            jsonp: 'callback',
            url: window.location.protocol+'//tile.indoor.io/api/Tileset/'+project.levels[i].source+'?callback=?'
          })
          .done(function(data) {
 	    levelJsonLoaded(data, project, i);
          });
      }
    }

    // when we've got the project JSON that defines the levels, load each level
    function projectJsonLoaded(data) {
      project = data;
      if(typeof project == 'string') project = JSON.parse(project);
      georeferences = project.georeferences;
      for(var i in project.levels) {
	if(!routingId) routingId = project.levels[i].source;
        levelLoadFunction(project, i)(); 
      }
    }

    // this ajax call is the beginning of the map initialization!
    $.ajax({
       dataType: 'jsonp',
       jsonp: 'callback',
       url: window.location.protocol+'//tile.indoor.io/export/web/'+_.map+'/'+_.project+'?callback=?'
      }).done(projectJsonLoaded);

    // end of the L.indoor.map definition; return the map object that has all the functions defined above
    return map;
  }, gridControl: function(gridLayer, options) {
    var instance = new L.mapbox.gridControl(gridLayer);
    for(var i in options) {
      instance.options[i] = options[i];
    }
    instance._show = function() {};

    // override _click function if a new version of it is defined
    if(instance.options.click) instance._click = function(event) {
      event.latLng.level = map.getLevel();
      if(event.data && event.data['_featureIdentifier']) {
        event.feature = map.parseUTFGridData(event.data);
        delete event.data;    
      }
      this.options.click(event);
    };

    // override _hover function if a new version of it is defined
    if(instance.options.hover) instance._mousemove = function(event) {
      event.latLng.level = map.getLevel();
      if(event.data && event.data['_featureIdentifier']) {
	event.feature = map.parseUTFGridData(event.data);
	delete event.data;
      }
      this.options.hover(event);  
    };
    return instance;
  }
};


/** Minified code for coordinate conversions
*/

var IMath=function(){function z(a,c,b,d){return Math.sqrt((a-b)*(a-b)+(c-d)*(c-d))}function y(a,c){if(a.z!==undefined&&c.z!==undefined)return Math.sqrt((a.x-c.x)*(a.x-c.x)+(a.y-c.y)*(a.y-c.y)+(a.z-c.z)*(a.z-c.z));return Math.sqrt((a.x-c.x)*(a.x-c.x)+(a.y-c.y)*(a.y-c.y))}function x(a,c){var b=Math.cos(a/180*Math.PI),d=Math.sin(a/180*Math.PI);return{x:c.x*b-c.y*d,y:c.x*d+c.y*b}}function s(a){for(var c=0,b=0;b<a.length;b++){var d=(b+1)%a.length;c+=a[b].position!==undefined?0.5*(a[b].position.x*a[d].position.y-
a[d].position.x*a[b].position.y):0.5*(a[b].x*a[d].y-a[d].x*a[b].y)}return c}function j(a,c,b,d,e,f,h){if(a.index===undefined)a={position:a,index:-1};if(h)if(a.position.x<h.minx||a.position.x>h.maxx||a.position.y<h.miny||a.position.y>h.maxy)return false;if(b)for(h=0;h<b.length;h++)if(j(a,b[h].lines,null,null,e,true,b[h].bbox)==true)return false;b=0;if(d)for(h=0;h<d.length;h++){c=(h+1)%d.length;var g={x:d[h].x,y:d[h].y,dx:d[c].x-d[h].x,dy:d[c].y-d[h].y};g.dist=Math.sqrt(g.dx*g.dx+g.dy*g.dy);if(a.position.y!=
Math.max(g.y,g.y+g.dist*g.dy)){var i=k(a.position.x,a.position.y,1,0,1,g.x,g.y,g.dx,g.dy,g.dist);i!=null&&i.s>0&&i.t>=0&&i.t<=g.dist&&b++}}else if(c)for(h=0;h<c.length;h++){g=c[h];if(g.i1==a.index||g.i2==a.index)return false;if(e!==undefined)if(l(a.position.x,a.position.y,g.x,g.y,g.dx,g.dy,g.dist).dist<e)return f;if(a.position.y!=Math.max(g.y,g.y+g.dist*g.dy)){i=k(a.position.x,a.position.y,1,0,1,g.x,g.y,g.dx,g.dy,g.dist);i!=null&&i.s>0&&i.t>=0&&i.t<=g.dist&&b++}}else return false;if(b%2==1)return true;
return false}function k(a,c,b,d,e,f,h,g,i,m){if(b==0&&d==0){console.log("invalid line");return null}if(g==0&&i==0){console.log("invalid line");return null}var p=g*d-i*b;if(p==0){if(Math.abs(b)>Math.abs(d)){p=(f-a)/b;var t=(f+m*g-a)/b}else{p=(h-c)/d;t=(h+m*i-c)/d}if(Math.abs(g)>Math.abs(i)){var r=(a-f)/g;g=(a+e*b-f)/g}else{r=(c-h)/i;g=(c+e*d-h)/i}return a+p*b==f&&c+p*d==h?p>=0&&p<=e?{intersect:true,s:p,t:0}:t>=0&&t<=e?{intersect:true,s:t,t:m}:r>=0&&r<=m?{intersect:true,s:0,t:r}:g>=0&&g<=m?{intersect:true,
s:e,t:g}:{intersect:false,s:p,t:0}:null}else{p=(a*d-c*b-f*d+h*b)/p;a=Math.abs(b)>Math.abs(d)?(f+p*g-a)/b:(h+p*i-c)/d;return{intersect:a>=0&&p>=0&&a<=e&&p<=m,s:a,t:p}}}function l(a,c,b,d,e,f,h){var g=e*e+f*f;if(g==0){console.log("invalid line");return null}else{g=(a*f-c*e-b*f+d*e)/g;var i=Math.abs(e)>Math.abs(f)?(a-b-g*f)/e:(c-d+g*e)/f;if(i>=0&&i<=h||h<0)return{s:i,t:g,x:b+i*e,y:d+i*f,dist:Math.abs(g)};else{a=i<0?z(a,c,b,d):z(a,c,b+h*e,d+h*f);return{s:i,dist:a}}}}function n(a,c){return a.z===undefined&&
c.z===undefined?{x:a.x-c.x,y:a.y-c.y,z:0}:{x:a.x-c.x,y:a.y-c.y,z:a.z-c.z}}function q(a,c){var b=1-c,d=b*b,e=d*b,f=c*c,h=f*c,g={x:e*a[0].x+3*d*c*a[1].x+3*b*f*a[2].x+h*a[3].x,y:e*a[0].y+3*d*c*a[1].y+3*b*f*a[2].y+h*a[3].y};if(a[0].z!==undefined)g.z=e*a[0].z+3*d*c*a[1].z+3*b*f*a[2].z+h*a[3].z;return g}function o(a,c){var b=1-c,d=b*b,e=c*c,f={x:-3*d*a[0].x+3*d*a[1].x+-6*c*b*a[1].x+6*c*b*a[2].x+-3*e*a[2].x+3*e*a[3].x,y:-3*d*a[0].y+3*d*a[1].y+-6*c*b*a[1].y+6*c*b*a[2].y+-3*e*a[2].y+3*e*a[3].y};if(a[0].z!==
undefined)f.z=-3*d*a[0].z+3*d*a[1].z+-6*c*b*a[1].z+6*c*b*a[2].z+-3*e*a[2].z+3*e*a[3].z;return f}function w(a,c,b){if(b===undefined)return q(a,c);var d=q(a,c);a=E(x(-90,o(a,c)));return{x:d.x+b*a.x,y:d.y+b*a.y,z:0}}function v(a,c){return{x:a.y*c.z-a.z*c.y,y:a.z*c.x-a.x*c.z,z:a.x*c.y-a.y*c.x}}function E(a,c){if(c===undefined)c=1;var b=Math.sqrt(a.x*a.x+a.y*a.y);return{x:c*a.x/b,y:c*a.y/b}}function C(a,c){if(c===undefined)c=1;var b=Math.sqrt(a.x*a.x+a.y*a.y+a.z*a.z);return{x:c*a.x/b,y:c*a.y/b,z:c*a.z/
b}}var A=null;if(typeof module=="undefined")A=jspoly2tri;return{distance:z,distancePP:y,distanceWGS:function(a,c){var b=a.lon,d=a.lat,e=c.lon,f=c.lat;b=Math.PI*b/180;d=Math.PI*d/180;e=Math.PI*e/180;f=Math.PI*f/180;var h;h=Math.sin(0.5*(f-d));h*=h;b=Math.sin(0.5*(e-b));b*=b;d=Math.cos(d);f=Math.cos(f);return 1.2734889314199999E7*Math.asin(Math.sqrt(d*f*b+h))},rotateCCW:x,rotateAxis:function(a,c,b){var d=c.x,e=c.y;c=c.z;var f=Math.cos(b);b=Math.sin(b);d=[f+d*d*(1-f),d*e*(1-f)-c*b,d*c*(1-f)+e*b,0,d*
e*(1-f)+c*b,f+e*e*(1-f),e*c*(1-f)-d*b,0,d*c*(1-f)-e*b,e*c*(1-f)+d*b,f+c*c*(1-f),0,0,0,0,1];if(d==null)d=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1];return{x:d[0]*a.x+d[1]*a.y+d[2]*a.z+d[3],y:d[4]*a.x+d[5]*a.y+d[6]*a.z+d[7],z:d[8]*a.x+d[9]*a.y+d[10]*a.z+d[11],w:d[12]*a.x+d[13]*a.y+d[14]*a.z+d[15]*(a.w?a.w:1)}},calculateRotatedBB:function(a,c,b){var d=x(b,{x:1,y:0});b=x(b,{x:0,y:1});c=c.position;for(var e,f,h,g,i,m,p,t,r=0;r<a.length;r++){var u=a[r].position,B=((u.x-c.x)*d.y-(u.y-c.y)*d.x)/(b.x*d.y-b.y*d.x),
D=Math.abs(d.x)>Math.abs(d.y)?(u.x-c.x-B*b.x)/d.x:(u.y-c.y-B*b.y)/d.y;if(r==0||D<i)i=D;if(r==0||D>m)m=D;if(r==0||B<p)p=B;if(r==0||B>t)t=B;if(r==0||u.x<e)e=u.x;if(r==0||u.x>f)f=u.x;if(r==0||u.y<h)h=u.y;if(r==0||B>g)g=u.y}return{horiz:d,vert:b,mins:i,maxs:m,mint:p,maxt:t,minx:e,maxx:f,midx:(e+f)/2,miny:h,maxy:g,midy:(h+g)/2}},calculateRotatedBB2:function(a,c,b){var d=999999,e=999999,f=-999999,h=-999999;c=c.position;for(var g=0;g<a.length;g++){var i,m=a[g].position;i=c;m=IMath.rotateCCW(b,{x:m.x-i.x,
y:m.y-i.y});i={x:i.x+m.x,y:i.y+m.y};d=Math.min(d,i.x);f=Math.max(f,i.x);e=Math.min(e,i.y);h=Math.max(h,i.y)}return{minx:d-10,maxx:f+10,miny:e-10,maxy:h+10}},calculateArea:s,calculateBBox:function(a){for(var c=0,b=0,d=0,e=0,f=0;f<a.length;f++){var h=a[f].position.x,g=a[f].position.y;if(h<c||f==0)c=h;if(h>b||f==0)b=h;if(g<d||f==0)d=g;if(g>e||f==0)e=g}return{minx:c,maxx:b,miny:d,maxy:e}},calculateScreenArea:function(a,c,b){for(var d=-1,e=0;e<b.length;e++)if(b[e].x>=0&&b[e].x<=a&&b[e].y>=0&&b[e].y<=c){d=
e;break}if(d==-1)return{area:0,pts:[]};for(var f=0;f<4;f++){var h=[];for(e=0;e<b.length;e++){var g=b[(d+e)%b.length],i=b[(d+e+1)%b.length];switch(f){case 0:if(i.x<0){var m=-g.x/(i.x-g.x);h.push({x:0,y:g.y+m*(i.y-g.y)})}else h.push(i);break;case 1:if(i.x>a){m=(a-g.x)/(i.x-g.x);h.push({x:a,y:g.y+m*(i.y-g.y)})}else h.push(i);break;case 2:if(i.y<0){m=-g.y/(i.y-g.y);h.push({y:0,x:g.x+m*(i.x-g.x)})}else h.push(i);break;case 3:if(i.y>c){m=(c-g.y)/(i.y-g.y);h.push({y:c,x:g.x+m*(i.x-g.x)})}else h.push(i)}}b=
h}return{area:Math.abs(s(b)),pts:b}},weighedCenter:function(a){for(var c,b,d,e,f=0;f<a.length;f++){if(f==0||a[f].position.x<c)c=a[f].position.x;if(f==0||a[f].position.y<b)b=a[f].position.y;if(f==0||a[f].position.x>d)d=a[f].position.x;if(f==0||a[f].position.y>e)e=a[f].position.y}return{x:(c+d)/2,y:(b+e)/2}},insidePA:j,triangulate:function(a,c,b){if(typeof module!="undefined"&&A==null)A=require("./poly2tri.js");try{for(var d=[],e=0;e<a.length;e++)d.push(new A.Point(a[e].position.x,a[e].position.y));
var f=new A.SweepContext(d);if(c)for(a=0;a<c.length;a++)for(var h=0;h<c[a].loops.length;h++){var g=c[a].loops[h].vertices;d=[];for(e=0;e<g.length;e++)d.push(new A.Point(g[e].position.x,g[e].position.y));f.AddHole(d)}A.sweep.Triangulate(f);var i=f.GetTriangles();c={positions:[],indices:[]};for(d=0;d<i.length;d++){var m=i[d].GetPoint(0),p=i[d].GetPoint(1),t=i[d].GetPoint(2),r=c.positions.length;c.positions.push({x:m.x,y:m.y,z:b},{x:p.x,y:p.y,z:b},{x:t.x,y:t.y,z:b});c.indices.push([r,r+1,r+2])}return c}catch(u){typeof module==
"undefined"?console.log("error triangulating: "+u):process.stderr.write("error triangulating: "+u);return null}},intersect:k,distancePL:l,calcRays:function(a,c){var b=c.x-a.x,d=c.y-a.y,e=Math.sqrt(b*b+d*d);b/=e;d/=e;var f=-d,h=b,g=(getLineAngle(a,c)-90+360)%360,i=[];i.push({srca:g,dsta:g,x:a.x+buffer*f,y:a.y+buffer*h,dx:b,dy:d,dist:e});i.push({srca:g+180,dsta:g+180,x:a.x-buffer*f,y:a.y-buffer*h,dx:b,dy:d,dist:e});b=90-Math.acos(buffer/(0.5*e))/Math.PI*180;if(isNaN(b)==false){f=g+b;h=f+180;var m=a.x+
buffer*Math.cos((90-f)/180*Math.PI),p=a.y+buffer*Math.sin((90-f)/180*Math.PI);b=c.x+buffer*Math.cos((90-h)/180*Math.PI);d=c.y+buffer*Math.sin((90-h)/180*Math.PI);b-=m;d-=p;var t=Math.sqrt(b*b+d*d);b/=t;d/=t;i.push({srca:f,dsta:h,x:m,y:p,dx:b,dy:d,dist:t})}b=90-Math.acos(buffer/(0.5*e))/Math.PI*180;if(isNaN(b)==false){f=g+180-b;h=f+180;m=a.x+buffer*Math.cos((90-f)/180*Math.PI);p=a.y+buffer*Math.sin((90-f)/180*Math.PI);b=c.x+buffer*Math.cos((90-h)/180*Math.PI);d=c.y+buffer*Math.sin((90-h)/180*Math.PI);
b-=m;d-=p;t=Math.sqrt(b*b+d*d);b/=t;d/=t;i.push({srca:f,dsta:h,x:m,y:p,dx:b,dy:d,dist:t})}for(e=0;e<i.length;e++){i[e].srca=rounda(i[e].srca);i[e].dsta=rounda(i[e].dsta)}return i},vecsub:n,vecadd:function(a,c){if(a.z!==undefined)return{x:a.x+c.x,y:a.y+c.y,z:a.z+c.z};return{x:a.x+c.x,y:a.y+c.y}},vecdot:function(a,c){return a.x*c.x+a.y*c.y},veccross:v,normalize:E,normalize3:C,calcNormal:function(a,c,b){c=n(c,a);a=n(b,a);a=v(c,a);return C(a)},calcUV:function(a,c,b,d){b=n(b,c);c=n(d,c);if(b.x==0&&b.y==
0&&b.z==0||c.x==0&&c.y==0&&c.z==0)return{u:a.x,v:a.y};d=v(b,c);d=C(d);b=d.x<1?{x:1,y:0,z:0}:d.y<1?{x:0,y:1,z:0}:{x:0,y:0,z:1};c=v(d,b);b=v(c,d);b=C(b);c=C(c);d=c.x*b.y-c.y*b.x;if(d==0){d=c.y*b.z-c.z*b.y;d=(a.y*b.z-a.z*b.y)/d}else d=(a.x*b.y-a.y*b.x)/d;return{u:Math.abs(b.x)>Math.abs(b.y)?Math.abs(b.x)>Math.abs(b.z)?(a.x-d*c.x)/b.x:(a.x-d*c.x)/b.x:Math.abs(b.y)>Math.abs(b.z)?(a.y-d*c.y)/b.y:(a.z-d*c.z)/b.z,v:d}},bezierPt:w,bezierTan:o,bezierLen:function(a){for(var c=0,b=w(a,0),d=0;d<100;d++){var e=
w(a,(d+1)/100);c+=y(b,e);b=e}return c},bezierParamAtLen:function(a,c){for(var b=0,d=w(a,0),e=-1,f,h=0;h<100;h++){var g=(h+1)/100,i=w(a,g);b+=y(d,i);if(b>c&&e==-1){f=b;e=g}d=i}if(e<0)return 1;e-=(f-c)/b;if(e<0)e=0;return e}}}();
L.indoor.coordinates=function(){function z(j){return Math.log(Math.tan(0.5*j+0.25*Math.PI))}function y(j,k,l,n){if(l==null)l=67108864;if(n==null)n=67108864;var q=85.05113/180*Math.PI;if(k>180)k-=360;if(k<-180)k+=360;j=j/180*Math.PI;k=k/180*Math.PI;l/=2;n/=2;k=l+l*k/Math.PI;j=j>q?0:j<-q?n*2:n-z(j)/z(q)*n;return{x:k,y:j}}function x(j){j.y=s-j.y;j.x-=s;return j}var s=2.003750834E7;return{WGS84ToLocal:function(j,k,l,n){var q=y(l.lat,l.lon,2*s,2*s),o=y(n.lat,n.lon,2*s,2*s);j=y(j,k,2*s,2*s);q=x(q);o=x(o);
j=x(j);k=o.x-q.x;o=o.y-q.y;n={x:n.position.x-l.position.x,y:n.position.y-l.position.y};var w={x:-n.y,y:n.x},v=(o*(j.y-q.y)+k*j.x-q.x*k)/(o*o+k*k);q=(j.x-q.x-v*k)/o;q=-q;return{x:l.position.x+v*n.x+q*w.x,y:l.position.y+v*n.y+q*w.y}},localToWGS84:function(j,k,l,n){var q=x(y(l.lat,l.lon,2*s,2*s)),o=x(y(n.lat,n.lon,2*s,2*s));j={x:j,y:k};k=n.position.x-l.position.x;n=n.position.y-l.position.y;o={x:o.x-q.x,y:o.y-q.y};var w={x:-o.y,y:o.x},v=(n*(j.y-l.position.y)+k*j.x-l.position.x*k)/(n*n+k*k);l=(j.x-l.position.x-
v*k)/n;l=-l;k={x:q.x+v*o.x+l*w.x,y:q.y+v*o.y+l*w.y};k.y=s-k.y;k.x+=s;q=k.y;o=2*s;j=2*s;if(o==null)o=67108864;if(j==null)j=67108864;l=85.05113/180*Math.PI;o/=2;j/=2;k=(k.x-o)/o*180;o=0;if(q<0)o=l;else if(q>j*2)o=-l;else{l=z(l);o=(2*Math.atan(Math.exp((j-q)*l/j))-0.5*Math.PI)*180/Math.PI}return{lat:o,lon:k}}}}();

// trigger an 'indoorjs' event; there may be somebody listening to it
// this event means just that indoor.js has been defined
$(document).trigger('indoorjs');
