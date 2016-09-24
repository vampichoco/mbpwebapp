Imports System.Web
Imports System.Web.Services
Imports Newtonsoft.Json.Linq
Imports System.Web.Script.Serialization

Public Class addcobdet
    Implements System.Web.IHttpHandler

    Sub ProcessRequest(ByVal context As HttpContext) Implements IHttpHandler.ProcessRequest

        'Try
        context.Request.InputStream.Seek(0, 0)

        '.Response.Write(.Request.InputStream.Length)
        Dim rl As Integer = context.Request.InputStream.Length

        Debug.Write(rl)
        Dim reader As New System.IO.StreamReader(context.Request.InputStream)
        Dim inputString As String =
                reader.ReadToEnd()


        Dim j As JObject = JObject.Parse(inputString)

        Dim cobId As Integer =
                Integer.Parse(j("Cobranza").ToString())

        Dim Importe = Double.Parse(j("Importe").ToString())
        Dim fecha As Date = Date.Parse(j("Fecha").ToString())
        Dim hora = DateTime.Now

        Dim db As New mbpDataContext

        Dim cob = db.cobranzas.SingleOrDefault(Function(c) c.COBRANZA = cobId)


        Dim cobdet As New cobdet With {
            .COBRANZA = cobId,
            .COBRADOR = "SYS",
            .IMPORTE = Importe,
            .USUFECHA = fecha,
            .FECHA = fecha,
            .USUHORA = hora.ToString("hh:mm:ss"),
            .VENTA = cob.VENTA,
            .CLIENTE = cob.CLIENTE,
            .serieDocumento = 0,
            .TIPO_DOC = "TK",
            .Cargo_ab = "A",
            .MONEDA = "MN",
            .TIP_CAM = 1,
            .ABONO = 1,
            .USUARIO = "SYS"
        }



        cob.SALDO = cob.SALDO - Importe

        db.cobdets.InsertOnSubmit(cobdet)
        db.SubmitChanges()

        context.Response.StatusCode = 200

        Dim json As New JavaScriptSerializer

        Dim result As New With {
            .ID = cobdet.id,
            .FECHA = cobdet.FECHA.Value.ToShortDateString,
            .IMPORTE = cobdet.IMPORTE.Value,
            .ABONO = cobdet.ABONO.Value
        }

        context.Response.Write(json.Serialize(result))

        'Catch ex As Exception
        '    context.Response.StatusCode = 500
        'End Try



    End Sub

    ReadOnly Property IsReusable() As Boolean Implements IHttpHandler.IsReusable
        Get
            Return False
        End Get
    End Property

End Class