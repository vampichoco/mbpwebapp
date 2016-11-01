Imports System.Web
Imports System.Web.Services
Imports Newtonsoft.Json.Linq
Imports System.Web.Script.Serialization

Public Class makeOrder
    Implements System.Web.IHttpHandler

    Sub ProcessRequest(ByVal context As HttpContext) Implements IHttpHandler.ProcessRequest

        Dim ppCache As New List(Of pedpar)

        With context
            Try
                Dim db As New mbpDataContext

                .Request.InputStream.Seek(0, 0)

                '.Response.Write(.Request.InputStream.Length)
                Dim rl As Integer = context.Request.InputStream.Length
                Debug.Write(rl)
                Dim reader As New System.IO.StreamReader(context.Request.InputStream)
                Dim inputString As String =
                    reader.ReadToEnd()

                Dim j As JObject = JObject.Parse(inputString)

                Dim pedId As Integer = GetID("pedidos", db)
                Dim pedParId As Integer = GetID("pedpar", db)
                Dim noRef As Integer = getNoRef("PedidoApp", db)

                Dim cid As String = j("ClientId").ToString()
                Dim vend As String = j("Vendedor").ToString()

                Dim c = db.clients.SingleOrDefault(Function(_c) _c.CLIENTE = cid)

                Dim ppArr = j("Partidas").ToArray()

                Dim count As Integer = 0
                Dim tc As Integer = 0

                Dim total As Single = 0.0
                Dim impuestoTotal As Single = 0.0

                For tc = 0 To ppArr.Count - 1
                    Dim data = ppArr(tc)

                    Dim cantidad As Single = Single.Parse(data("Cantidad").ToString)
                    Dim precioU As Single = Single.Parse(data("Precio").ToString)
                    Dim impuesto As Single = Single.Parse(data("Impuesto").ToString)


                    Dim precio As Double = precioU * cantidad
                    impuestoTotal = impuestoTotal + ((precioU * cantidad) * impuesto)

                    total = total + precio
                Next

                Dim p As New pedido With {
                        .pedido = pedId,
                        .F_EMISION = DateTime.Now.Date,
                        .CLIENTE = c.CLIENTE,
                        .VEND = vend,
                        .DESCUENTO = 0,
                        .IMPUESTO = impuestoTotal,
                        .PRECIO = 1,
                        .COSTO = 0,
                        .ALMACEN = 1,
                        .ESTADO = "PE",
                        .OBSERV = "Pedido hecho con App movil",
                        .TIPO_CAM = 1,
                        .MONEDA = "MN",
                        .DESC1 = 0,
                        .DESC2 = 0,
                        .DESC3 = 0,
                        .DESC4 = 0,
                        .DESC5 = 0,
                        .DATOS = "Hello World",
                        .DESGLOSE = 1,
                        .USUARIO = "SUP",
                        .USUFECHA = DateTime.Now.Date,
                        .USUHORA = DateTime.Now.ToString("hh:mm:ss"),
                        .RELACION = "(Al mismo)",
                        .PEDCLI = noRef,
                        .AplicarDes = 1,
                        .Entrega = DateTime.Now.AddDays(1).Date,
                        .Tipo = "PE",
                        .no_ped = GetMax("pedidos", "no_ped", db),
                        .donativo = 0,
                        .ocupado = 0,
                        .IMPORTE = total
                    }

                db.pedidos.InsertOnSubmit(p)

                For count = 0 To ppArr.Count - 1

                    Dim data = ppArr(count)
                    Dim pvid = pedParId + count

                    Dim precioStr = data("Precio").ToString().Replace(",", ".")

                    Dim precioU As Single = Single.Parse(precioStr, System.Globalization.CultureInfo.InvariantCulture)
                    Dim cantidad As Single = Single.Parse(data("Cantidad"), System.Globalization.CultureInfo.InvariantCulture)
                    Dim impuesto As Single = Single.Parse(data("Impuesto"), System.Globalization.CultureInfo.InvariantCulture)
                    Dim prcantidad As Single = Single.Parse(data("Prcantidad"), System.Globalization.CultureInfo.InvariantCulture)
                    Dim prdescrip As String = data("Prdescrip")

                    Dim artStr As String = (data("Articulo")).ToString()

                    Dim precio As Double = precioU
                    Console.WriteLine(precio)

                    Dim taxFactor = impuesto / 100

                    Dim pr = db.prods.SingleOrDefault(Function(_p) _p.ARTICULO = artStr)

                    Console.WriteLine(precio)

                    Dim newPP As New pedpar With {
                        .pedido = pedId,
                        .ARTICULO = pr.ARTICULO,
                        .CANTIDAD = cantidad,
                        .SURTIDO = 0,
                        .POR_SURT = cantidad,
                        .PRECIO = Math.Round(precio, 3),
                        .DESCUENTO = 0,
                        .IMPUESTO = impuesto * 100,
                        .OBSERV = pr.DESCRIP,
                        .ID_SALIDA = pvid,
                        .Usuario = "SUP",
                        .UsuFecha = DateTime.Now.Date,
                        .UsuHora = DateTime.Now.ToString("hh:mm:ss"),
                        .Almacen = 1,
                        .Lista = 1,
                        .Clave = "",
                        .PRCANTIDAD = prcantidad,
                        .PRDESCRIP = prdescrip,
                        .donativo = 0
                        }

                    db.pedpars.InsertOnSubmit(newPP)
                    ppCache.Add(newPP)


                Next

                Dim json As New JavaScriptSerializer()


                Try
                    db.SubmitChanges()
                    .Response.Write(json.Serialize(p))
                    .Response.StatusCode = 200
                Catch ex As Exception
                    Dim err = New With {.m = ex.Message, .ped = p, .pedpar = ppCache}
                    context.Response.Write(err)
                End Try


            Catch ex As Exception
                Dim json As New JavaScriptSerializer

                Debug.WriteLine("==" & ex.Message)

                Dim err As New With {.error = ex.Message,
                    .stackTrace = ex.StackTrace}

                context.Response.Clear()
                context.Response.Write(json.Serialize(err))
                .Response.StatusCode = 500
            End Try
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

    Public Function getNoRef(ByVal scope As String, db As mbpDataContext) As Integer
        Dim dato = db.consecs.Single(Function(c) c.Dato = scope)
        Dim consec = dato.Consec
        dato.Consec += 1
        db.SubmitChanges()
        Return consec
    End Function

    Public Sub updateNoRef(ByVal scope As String, db As mbpDataContext)
        Dim dato = db.consecs.Single(Function(c) c.Dato = scope)
        dato.Consec += 1
        db.SubmitChanges()

    End Sub

End Class