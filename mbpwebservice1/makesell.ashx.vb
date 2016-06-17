Imports System.Web
Imports System.Web.Services
Imports Newtonsoft.Json
Imports Newtonsoft.Json.Linq
Imports System.Web.Script.Serialization


Public Class makesell
    Implements System.Web.IHttpHandler

    Sub ProcessRequest(ByVal context As HttpContext) Implements IHttpHandler.ProcessRequest



        With context


            'Try
            Dim db As New mbpDataContext

            .Request.InputStream.Seek(0, 0)

            '.Response.Write(.Request.InputStream.Length)
            Dim rl As Integer = context.Request.InputStream.Length
            Debug.Write(rl)
            Dim reader As New System.IO.StreamReader(context.Request.InputStream)
            Dim inputString As String =
                reader.ReadToEnd()

            Dim j As JObject = JObject.Parse(inputString)

            Dim vtaId As Integer = GetID("ventas", db)
            Dim partVtaId As Integer = GetID("partvta", db)
            Dim noRef As Integer = GetMax("ventas", "no_referen", db)

            'Dim pid As String = j("IdVenta").ToString()
            Dim cid As String = j("ClientId").ToString()


            Dim c = db.clients.SingleOrDefault(Function(_c) _c.CLIENTE = cid)

            Dim pvArr = j("Partidas").ToArray()

            Dim count As Integer = 0
            Dim tc As Integer = 0

            Dim total As Single = 0.0

            For tc = 0 To pvArr.Count - 1
                Dim data = pvArr(count)

                Dim cantidad As Single = Single.Parse(data("Cantidad"))
                Dim precioU As Single = Single.Parse(data("Precio"))
                Dim impuesto As Single = Single.Parse(data("Impuesto"))

                Dim precio As Double = precioU * cantidad

                precio = precio + (precio * impuesto)
                total = total + precio
            Next

            Dim v As New venta With {
                            .ALMACEN = 1,
                            .VENTA = vtaId,
                            .PRECIO = total,
                            .CLIENTE = c.CLIENTE,
                            .USUFECHA = DateTime.Now,
                            .IMPORTE = total,
                            .sucremota = "Local",
                            .businessintelligence = 0,
                            .cambioDeEstado = 0,
                            .Ticket = 1,
                            .CIERRE = 0,
                            .IMPUESTO = 0,
                            .ENFAC = 0,
                            .serieDocumento = "T",
                            .TIPO_DOC = "REM",
                            .NO_REFEREN = noRef
                        }

            db.ventas.InsertOnSubmit(v)


            For count = 0 To pvArr.Count - 1
                Dim data = pvArr(count)
                Dim pvid = partVtaId + count

                Dim precioU As Single = Single.Parse(data("Precio"))
                Dim cantidad As Single = Single.Parse(data("Cantidad"))
                Dim impuesto As Single = Single.Parse(data("Impuesto"))
                Dim costo As Single = Single.Parse(data("Costo"))
                Dim artStr As String = (data("Articulo")).ToString()

                Dim precio As Double = precioU * cantidad

                precio = precio + (precio * impuesto)

                Dim p = db.prods.SingleOrDefault(Function(_p) _p.ARTICULO = artStr)




                Dim pv As New partvta With {
                             .PRECIO = precio,
                             .ALMACEN = 1,
                             .ARTICULO = p.ARTICULO,
                             .VENTA = v.VENTA,
                             .COSTO = costo,
                             .CANTIDAD = cantidad,
                             .DESCUENTO = 0,
                             .IMPUESTO = 0,
                             .ID_SALIDA = pvid,
                             .PrecioBase = precioU,
                             .Devolucion = 0,
                             .DevConf = 0,
                             .ID_entrada = 0,
                             .Invent = 0,
                             .importe = precio,
                             .kit = 0,
                             .costo_u = costo,
                             .iespecial = 0,
                             .colores = 0,
                             .verificado = 0,
                             .A01 = 0,
                             .serieDocumento = 0
                             }

                db.partvtas.InsertOnSubmit(pv)

            Next




            .Response.StatusCode = 200
            Dim json As New JavaScriptSerializer()

            .Response.Write(json.Serialize(v))

            db.SubmitChanges()
            'Catch ex As Exception
            '    .Response.StatusCode = 500
            'End Try



        End With


    End Sub

    ReadOnly Property IsReusable() As Boolean Implements IHttpHandler.IsReusable
        Get
            Return False
        End Get
    End Property

    Public Function GetID(ByVal Table As String, db As mbpDataContext) As Integer
        Dim cmdStr As String = String.Format("SELECT IDENT_CURRENT('{0}')", Table)
        Dim cmd = Convert.ToInt32(db.ExecuteQuery(Of Decimal)(cmdStr, New Object() {}).FirstOrDefault)
        Dim id As Integer = cmd + 1

        Return id

    End Function

    Public Function GetMax(ByVal Table As String, row As String, db As mbpDataContext) As Integer
        Dim cmdStr As String = String.Format("select Max({1}) as Consec from {0}", Table, row)
        Dim cmd = Convert.ToInt32(db.ExecuteQuery(Of Integer)(cmdStr, New Object() {}).FirstOrDefault)
        Dim id As Integer = cmd + 1

        Return id

    End Function

End Class